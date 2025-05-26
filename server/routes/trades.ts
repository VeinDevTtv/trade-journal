import { Router, Request, Response } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { verifyToken } from '@/middleware/auth';
import { executeQuery, executeSingle, executeTransaction } from '@/config/database';
import { 
  Trade, 
  TradeResponse, 
  CreateTradeRequest, 
  UpdateTradeRequest,
  ApiResponse,
  PaginatedResponse 
} from '@/types';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || 'uploads/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `trade-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880') // 5MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Validation rules
const createTradeValidation = [
  body('symbol').notEmpty().withMessage('Symbol is required'),
  body('direction').isIn(['Buy', 'Sell']).withMessage('Direction must be Buy or Sell'),
  body('entry_price').isFloat({ min: 0 }).withMessage('Entry price must be a positive number'),
  body('exit_price').isFloat({ min: 0 }).withMessage('Exit price must be a positive number'),
  body('volume').isFloat({ min: 0 }).withMessage('Volume must be a positive number'),
  body('account_id').isInt({ min: 1 }).withMessage('Account ID must be a positive integer'),
  body('trade_date').isISO8601().withMessage('Trade date must be a valid date'),
  body('trade_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Trade time must be in HH:MM format'),
  body('stop_loss').optional().isFloat({ min: 0 }).withMessage('Stop loss must be a positive number'),
  body('take_profit').optional().isFloat({ min: 0 }).withMessage('Take profit must be a positive number'),
  body('notes').optional().isLength({ max: 2000 }).withMessage('Notes must be less than 2000 characters'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('tags.*').optional().isLength({ max: 100 }).withMessage('Each tag must be less than 100 characters')
];

const updateTradeValidation = [
  param('id').isInt({ min: 1 }).withMessage('Trade ID must be a positive integer'),
  ...createTradeValidation.map(rule => rule.optional())
];

// Helper function to calculate trade metrics
async function calculateTradeMetrics(
  symbol: string,
  direction: 'Buy' | 'Sell',
  entryPrice: number,
  exitPrice: number,
  volume: number,
  stopLoss?: number,
  takeProfit?: number
) {
  // Import calculation functions from the existing lib
  const { calculateProfit, calculateRRR } = await import('../lib/trade-calculations');
  
  const profitData = await calculateProfit(symbol, direction, entryPrice, exitPrice, volume);
  
  let rrr: number | null = null;
  if (stopLoss && takeProfit) {
    rrr = calculateRRR(stopLoss, takeProfit, entryPrice);
  }

  return {
    profit: profitData.profit,
    pips: profitData.pips,
    pip_value: profitData.pipValue,
    is_win: profitData.isWin,
    rrr
  };
}

// GET /api/trades - Get all trades for user with pagination and filtering
router.get('/', 
  verifyToken,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('symbol').optional().isString().withMessage('Symbol must be a string'),
    query('direction').optional().isIn(['Buy', 'Sell']).withMessage('Direction must be Buy or Sell'),
    query('is_win').optional().isBoolean().withMessage('is_win must be a boolean'),
    query('account_id').optional().isInt({ min: 1 }).withMessage('Account ID must be a positive integer'),
    query('date_from').optional().isISO8601().withMessage('date_from must be a valid date'),
    query('date_to').optional().isISO8601().withMessage('date_to must be a valid date')
  ],
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
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      // Build WHERE clause based on filters
      let whereClause = 'WHERE t.user_id = ?';
      const params: any[] = [userId];

      if (req.query.symbol) {
        whereClause += ' AND t.symbol = ?';
        params.push(req.query.symbol);
      }

      if (req.query.direction) {
        whereClause += ' AND t.direction = ?';
        params.push(req.query.direction);
      }

      if (req.query.is_win !== undefined) {
        whereClause += ' AND t.is_win = ?';
        params.push(req.query.is_win === 'true');
      }

      if (req.query.account_id) {
        whereClause += ' AND t.account_id = ?';
        params.push(req.query.account_id);
      }

      if (req.query.date_from) {
        whereClause += ' AND t.trade_date >= ?';
        params.push(req.query.date_from);
      }

      if (req.query.date_to) {
        whereClause += ' AND t.trade_date <= ?';
        params.push(req.query.date_to);
      }

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM trades t 
        ${whereClause}
      `;
      const countResult = await executeQuery<{ total: number }>(countQuery, params);
      const total = countResult[0].total;

      // Get trades with account names and tags
      const tradesQuery = `
        SELECT 
          t.*,
          a.name as account_name,
          GROUP_CONCAT(tt.tag) as tags
        FROM trades t
        LEFT JOIN accounts a ON t.account_id = a.id
        LEFT JOIN trade_tags tt ON t.id = tt.trade_id
        ${whereClause}
        GROUP BY t.id
        ORDER BY t.trade_date DESC, t.trade_time DESC
        LIMIT ? OFFSET ?
      `;

      const trades = await executeQuery<TradeResponse>(
        tradesQuery, 
        [...params, limit, offset]
      );

      // Process tags
      const processedTrades = trades.map(trade => ({
        ...trade,
        tags: trade.tags ? (trade.tags as any).split(',') : []
      }));

      const response: PaginatedResponse<TradeResponse> = {
        success: true,
        data: processedTrades,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };

      res.json(response);
    } catch (error) {
      console.error('Get trades error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
);

// GET /api/trades/:id - Get single trade
router.get('/:id',
  verifyToken,
  [param('id').isInt({ min: 1 }).withMessage('Trade ID must be a positive integer')],
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
      const tradeId = parseInt(req.params.id);

      const trades = await executeQuery<TradeResponse>(`
        SELECT 
          t.*,
          a.name as account_name,
          GROUP_CONCAT(tt.tag) as tags
        FROM trades t
        LEFT JOIN accounts a ON t.account_id = a.id
        LEFT JOIN trade_tags tt ON t.id = tt.trade_id
        WHERE t.id = ? AND t.user_id = ?
        GROUP BY t.id
      `, [tradeId, userId]);

      if (trades.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Trade not found'
        });
      }

      const trade = {
        ...trades[0],
        tags: trades[0].tags ? (trades[0].tags as any).split(',') : []
      };

      res.json({
        success: true,
        data: trade
      });
    } catch (error) {
      console.error('Get trade error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
);

// POST /api/trades - Create new trade
router.post('/',
  verifyToken,
  upload.single('screenshot'),
  createTradeValidation,
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
      const {
        symbol,
        direction,
        entry_price,
        exit_price,
        stop_loss,
        take_profit,
        volume,
        account_id,
        trade_date,
        trade_time,
        notes,
        tags
      } = req.body as CreateTradeRequest;

      // Verify account belongs to user
      const accounts = await executeQuery(
        'SELECT id FROM accounts WHERE id = ? AND user_id = ?',
        [account_id, userId]
      );

      if (accounts.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid account ID'
        });
      }

      // Calculate trade metrics
      const metrics = await calculateTradeMetrics(
        symbol,
        direction,
        parseFloat(entry_price.toString()),
        parseFloat(exit_price.toString()),
        parseFloat(volume.toString()),
        stop_loss ? parseFloat(stop_loss.toString()) : undefined,
        take_profit ? parseFloat(take_profit.toString()) : undefined
      );

      const screenshotUrl = req.file ? `/uploads/${req.file.filename}` : null;

      // Insert trade and tags in transaction
      const result = await executeTransaction(async (connection) => {
        // Insert trade
        const [tradeResult] = await connection.execute(
          `INSERT INTO trades (
            user_id, account_id, symbol, direction, entry_price, exit_price,
            stop_loss, take_profit, volume, profit, pips, pip_value, rrr,
            is_win, trade_date, trade_time, notes, screenshot_url
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId, account_id, symbol, direction, entry_price, exit_price,
            stop_loss, take_profit, volume, metrics.profit, metrics.pips,
            metrics.pip_value, metrics.rrr, metrics.is_win, trade_date,
            trade_time, notes, screenshotUrl
          ]
        );

        const tradeId = (tradeResult as any).insertId;

        // Insert tags if provided
        if (tags && tags.length > 0) {
          for (const tag of tags) {
            await connection.execute(
              'INSERT INTO trade_tags (trade_id, tag) VALUES (?, ?)',
              [tradeId, tag]
            );
          }
        }

        return tradeId;
      });

      res.status(201).json({
        success: true,
        data: { id: result },
        message: 'Trade created successfully'
      });
    } catch (error) {
      console.error('Create trade error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
);

// PUT /api/trades/:id - Update trade
router.put('/:id',
  verifyToken,
  upload.single('screenshot'),
  updateTradeValidation,
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
      const tradeId = parseInt(req.params.id);

      // Check if trade exists and belongs to user
      const existingTrades = await executeQuery<Trade>(
        'SELECT * FROM trades WHERE id = ? AND user_id = ?',
        [tradeId, userId]
      );

      if (existingTrades.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Trade not found'
        });
      }

      const existingTrade = existingTrades[0];
      const updateData = { ...req.body };

      // If account_id is being updated, verify it belongs to user
      if (updateData.account_id) {
        const accounts = await executeQuery(
          'SELECT id FROM accounts WHERE id = ? AND user_id = ?',
          [updateData.account_id, userId]
        );

        if (accounts.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Invalid account ID'
          });
        }
      }

      // Recalculate metrics if price/volume data changed
      let metrics = null;
      if (updateData.entry_price || updateData.exit_price || updateData.volume) {
        const entryPrice = updateData.entry_price || existingTrade.entry_price;
        const exitPrice = updateData.exit_price || existingTrade.exit_price;
        const volume = updateData.volume || existingTrade.volume;
        const symbol = updateData.symbol || existingTrade.symbol;
        const direction = updateData.direction || existingTrade.direction;
        const stopLoss = updateData.stop_loss || existingTrade.stop_loss;
        const takeProfit = updateData.take_profit || existingTrade.take_profit;

        metrics = await calculateTradeMetrics(
          symbol,
          direction,
          parseFloat(entryPrice.toString()),
          parseFloat(exitPrice.toString()),
          parseFloat(volume.toString()),
          stopLoss ? parseFloat(stopLoss.toString()) : undefined,
          takeProfit ? parseFloat(takeProfit.toString()) : undefined
        );
      }

      const screenshotUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

      await executeTransaction(async (connection) => {
        // Build update query dynamically
        const updateFields: string[] = [];
        const updateValues: any[] = [];

        Object.keys(updateData).forEach(key => {
          if (key !== 'tags' && updateData[key] !== undefined) {
            updateFields.push(`${key} = ?`);
            updateValues.push(updateData[key]);
          }
        });

        // Add calculated metrics if available
        if (metrics) {
          updateFields.push('profit = ?', 'pips = ?', 'pip_value = ?', 'is_win = ?');
          updateValues.push(metrics.profit, metrics.pips, metrics.pip_value, metrics.is_win);
          
          if (metrics.rrr !== undefined) {
            updateFields.push('rrr = ?');
            updateValues.push(metrics.rrr);
          }
        }

        // Add screenshot URL if uploaded
        if (screenshotUrl) {
          updateFields.push('screenshot_url = ?');
          updateValues.push(screenshotUrl);
        }

        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        updateValues.push(tradeId);

        if (updateFields.length > 1) { // More than just updated_at
          await connection.execute(
            `UPDATE trades SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
          );
        }

        // Update tags if provided
        if (updateData.tags) {
          // Delete existing tags
          await connection.execute(
            'DELETE FROM trade_tags WHERE trade_id = ?',
            [tradeId]
          );

          // Insert new tags
          for (const tag of updateData.tags) {
            await connection.execute(
              'INSERT INTO trade_tags (trade_id, tag) VALUES (?, ?)',
              [tradeId, tag]
            );
          }
        }
      });

      res.json({
        success: true,
        message: 'Trade updated successfully'
      });
    } catch (error) {
      console.error('Update trade error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
);

// DELETE /api/trades/:id - Delete trade
router.delete('/:id',
  verifyToken,
  [param('id').isInt({ min: 1 }).withMessage('Trade ID must be a positive integer')],
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
      const tradeId = parseInt(req.params.id);

      // Check if trade exists and get screenshot URL for cleanup
      const trades = await executeQuery<Trade>(
        'SELECT screenshot_url FROM trades WHERE id = ? AND user_id = ?',
        [tradeId, userId]
      );

      if (trades.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Trade not found'
        });
      }

      const trade = trades[0];

      // Delete trade (tags will be deleted by CASCADE)
      await executeSingle(
        'DELETE FROM trades WHERE id = ? AND user_id = ?',
        [tradeId, userId]
      );

      // Delete screenshot file if exists
      if (trade.screenshot_url) {
        const filePath = path.join(process.cwd(), trade.screenshot_url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      res.json({
        success: true,
        message: 'Trade deleted successfully'
      });
    } catch (error) {
      console.error('Delete trade error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
);

export default router; 