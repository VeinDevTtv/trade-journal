import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { verifyToken } from '@/middleware/auth';
import { executeQuery, executeSingle } from '@/config/database';
import { 
  Account, 
  CreateAccountRequest, 
  UpdateAccountRequest,
  ApiResponse 
} from '@/types';

const router = Router();

// Validation rules
const createAccountValidation = [
  body('name').notEmpty().withMessage('Account name is required'),
  body('type').isIn(['FTMO Challenge', 'MyForexFunds', 'Demo Account', 'Live Account', 'Other'])
    .withMessage('Invalid account type'),
  body('balance').isFloat({ min: 0 }).withMessage('Balance must be a positive number'),
  body('currency').isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters')
];

const updateAccountValidation = [
  param('id').isInt({ min: 1 }).withMessage('Account ID must be a positive integer'),
  body('name').optional().notEmpty().withMessage('Account name cannot be empty'),
  body('type').optional().isIn(['FTMO Challenge', 'MyForexFunds', 'Demo Account', 'Live Account', 'Other'])
    .withMessage('Invalid account type'),
  body('balance').optional().isFloat({ min: 0 }).withMessage('Balance must be a positive number'),
  body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean')
];

// GET /api/accounts - Get all accounts for user
router.get('/',
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;

      const accounts = await executeQuery<Account & {
        trades_count: number;
        total_profit: number;
      }>(`
        SELECT 
          a.*,
          COALESCE(t.trades_count, 0) as trades_count,
          COALESCE(t.total_profit, 0) as total_profit
        FROM accounts a
        LEFT JOIN (
          SELECT 
            account_id,
            COUNT(*) as trades_count,
            SUM(profit) as total_profit
          FROM trades
          GROUP BY account_id
        ) t ON a.id = t.account_id
        WHERE a.user_id = ?
        ORDER BY a.is_active DESC, a.created_at DESC
      `, [userId]);

      const response: ApiResponse<typeof accounts> = {
        success: true,
        data: accounts
      };

      res.json(response);
    } catch (error) {
      console.error('Get accounts error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
);

// GET /api/accounts/:id - Get single account
router.get('/:id',
  verifyToken,
  [param('id').isInt({ min: 1 }).withMessage('Account ID must be a positive integer')],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const userId = req.user!.id;
      const accountId = parseInt(req.params.id);

      const accounts = await executeQuery<Account & {
        trades_count: number;
        total_profit: number;
        win_rate: number;
      }>(`
        SELECT 
          a.*,
          COALESCE(t.trades_count, 0) as trades_count,
          COALESCE(t.total_profit, 0) as total_profit,
          COALESCE(t.win_rate, 0) as win_rate
        FROM accounts a
        LEFT JOIN (
          SELECT 
            account_id,
            COUNT(*) as trades_count,
            SUM(profit) as total_profit,
            ROUND((SUM(CASE WHEN is_win = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as win_rate
          FROM trades
          GROUP BY account_id
        ) t ON a.id = t.account_id
        WHERE a.id = ? AND a.user_id = ?
      `, [accountId, userId]);

      if (accounts.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Account not found'
        });
      }

      res.json({
        success: true,
        data: accounts[0]
      });
    } catch (error) {
      console.error('Get account error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
);

// POST /api/accounts - Create new account
router.post('/',
  verifyToken,
  createAccountValidation,
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const userId = req.user!.id;
      const { name, type, balance, currency } = req.body as CreateAccountRequest;

      // Check if account name already exists for this user
      const existingAccounts = await executeQuery(
        'SELECT id FROM accounts WHERE user_id = ? AND name = ?',
        [userId, name]
      );

      if (existingAccounts.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'Account name already exists'
        });
      }

      const result = await executeSingle(
        `INSERT INTO accounts (user_id, name, type, balance, currency) 
         VALUES (?, ?, ?, ?, ?)`,
        [userId, name, type, balance, currency]
      );

      res.status(201).json({
        success: true,
        data: { id: result.insertId },
        message: 'Account created successfully'
      });
    } catch (error) {
      console.error('Create account error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
);

// PUT /api/accounts/:id - Update account
router.put('/:id',
  verifyToken,
  updateAccountValidation,
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const userId = req.user!.id;
      const accountId = parseInt(req.params.id);

      // Check if account exists and belongs to user
      const existingAccounts = await executeQuery<Account>(
        'SELECT * FROM accounts WHERE id = ? AND user_id = ?',
        [accountId, userId]
      );

      if (existingAccounts.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Account not found'
        });
      }

      const updateData = req.body as UpdateAccountRequest;

      // Check if new name conflicts with existing accounts (if name is being updated)
      if (updateData.name) {
        const nameConflicts = await executeQuery(
          'SELECT id FROM accounts WHERE user_id = ? AND name = ? AND id != ?',
          [userId, updateData.name, accountId]
        );

        if (nameConflicts.length > 0) {
          return res.status(409).json({
            success: false,
            error: 'Account name already exists'
          });
        }
      }

      // Build update query dynamically
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof UpdateAccountRequest] !== undefined) {
          updateFields.push(`${key} = ?`);
          updateValues.push(updateData[key as keyof UpdateAccountRequest]);
        }
      });

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update'
        });
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(accountId);

      await executeSingle(
        `UPDATE accounts SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );

      res.json({
        success: true,
        message: 'Account updated successfully'
      });
    } catch (error) {
      console.error('Update account error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
);

// DELETE /api/accounts/:id - Delete account
router.delete('/:id',
  verifyToken,
  [param('id').isInt({ min: 1 }).withMessage('Account ID must be a positive integer')],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const userId = req.user!.id;
      const accountId = parseInt(req.params.id);

      // Check if account exists and belongs to user
      const existingAccounts = await executeQuery<Account>(
        'SELECT * FROM accounts WHERE id = ? AND user_id = ?',
        [accountId, userId]
      );

      if (existingAccounts.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Account not found'
        });
      }

      // Check if account has trades
      const tradesCount = await executeQuery<{ count: number }>(
        'SELECT COUNT(*) as count FROM trades WHERE account_id = ?',
        [accountId]
      );

      if (tradesCount[0].count > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete account with existing trades. Please delete trades first or deactivate the account.'
        });
      }

      // Delete account
      await executeSingle(
        'DELETE FROM accounts WHERE id = ? AND user_id = ?',
        [accountId, userId]
      );

      res.json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
);

// POST /api/accounts/:id/activate - Activate account
router.post('/:id/activate',
  verifyToken,
  [param('id').isInt({ min: 1 }).withMessage('Account ID must be a positive integer')],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const userId = req.user!.id;
      const accountId = parseInt(req.params.id);

      // Check if account exists and belongs to user
      const existingAccounts = await executeQuery<Account>(
        'SELECT * FROM accounts WHERE id = ? AND user_id = ?',
        [accountId, userId]
      );

      if (existingAccounts.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Account not found'
        });
      }

      await executeSingle(
        'UPDATE accounts SET is_active = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [accountId]
      );

      res.json({
        success: true,
        message: 'Account activated successfully'
      });
    } catch (error) {
      console.error('Activate account error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
);

// POST /api/accounts/:id/deactivate - Deactivate account
router.post('/:id/deactivate',
  verifyToken,
  [param('id').isInt({ min: 1 }).withMessage('Account ID must be a positive integer')],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const userId = req.user!.id;
      const accountId = parseInt(req.params.id);

      // Check if account exists and belongs to user
      const existingAccounts = await executeQuery<Account>(
        'SELECT * FROM accounts WHERE id = ? AND user_id = ?',
        [accountId, userId]
      );

      if (existingAccounts.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Account not found'
        });
      }

      await executeSingle(
        'UPDATE accounts SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [accountId]
      );

      res.json({
        success: true,
        message: 'Account deactivated successfully'
      });
    } catch (error) {
      console.error('Deactivate account error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
);

export default router; 