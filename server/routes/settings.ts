import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { verifyToken } from '@/middleware/auth';
import { executeQuery, executeSingle } from '@/config/database';
import { 
  UserSettings, 
  UpdateUserSettingsRequest,
  ApiResponse 
} from '@/types';

const router = Router();

// Validation rules
const updateSettingsValidation = [
  body('default_lot_size').optional().isFloat({ min: 0.01 }).withMessage('Default lot size must be at least 0.01'),
  body('default_risk_percentage').optional().isFloat({ min: 0.1, max: 100 }).withMessage('Default risk percentage must be between 0.1 and 100'),
  body('default_account_id').optional().isInt({ min: 1 }).withMessage('Default account ID must be a positive integer'),
  body('default_timeframe').optional().isString().withMessage('Default timeframe must be a string'),
  body('auto_calculate_position_size').optional().isBoolean().withMessage('Auto calculate position size must be a boolean'),
  body('enforce_risk_limits').optional().isBoolean().withMessage('Enforce risk limits must be a boolean'),
  body('max_risk_per_trade').optional().isFloat({ min: 0.1, max: 100 }).withMessage('Max risk per trade must be between 0.1 and 100'),
  body('max_daily_risk').optional().isFloat({ min: 0.1, max: 100 }).withMessage('Max daily risk must be between 0.1 and 100'),
  body('default_tags').optional().isString().withMessage('Default tags must be a string'),
  body('theme').optional().isIn(['light', 'dark', 'system']).withMessage('Theme must be light, dark, or system'),
  body('notifications_enabled').optional().isBoolean().withMessage('Notifications enabled must be a boolean')
];

// GET /api/settings - Get user settings
router.get('/',
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;

      const settings = await executeQuery<UserSettings>(`
        SELECT * FROM user_settings WHERE user_id = ?
      `, [userId]);

      if (settings.length === 0) {
        // Create default settings if they don't exist
        await executeSingle(
          'INSERT INTO user_settings (user_id) VALUES (?)',
          [userId]
        );

        // Fetch the newly created settings
        const newSettings = await executeQuery<UserSettings>(`
          SELECT * FROM user_settings WHERE user_id = ?
        `, [userId]);

        return res.json({
          success: true,
          data: newSettings[0]
        });
      }

      const response: ApiResponse<UserSettings> = {
        success: true,
        data: settings[0]
      };

      res.json(response);
    } catch (error) {
      console.error('Get settings error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
);

// PUT /api/settings - Update user settings
router.put('/',
  verifyToken,
  updateSettingsValidation,
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
      const updateData = req.body as UpdateUserSettingsRequest;

      // Validate default_account_id belongs to user if provided
      if (updateData.default_account_id) {
        const accounts = await executeQuery(
          'SELECT id FROM accounts WHERE id = ? AND user_id = ? AND is_active = 1',
          [updateData.default_account_id, userId]
        );

        if (accounts.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Invalid default account ID or account is not active'
          });
        }
      }

      // Check if settings exist
      const existingSettings = await executeQuery<UserSettings>(
        'SELECT * FROM user_settings WHERE user_id = ?',
        [userId]
      );

      if (existingSettings.length === 0) {
        // Create settings first
        await executeSingle(
          'INSERT INTO user_settings (user_id) VALUES (?)',
          [userId]
        );
      }

      // Build update query dynamically
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof UpdateUserSettingsRequest] !== undefined) {
          updateFields.push(`${key} = ?`);
          updateValues.push(updateData[key as keyof UpdateUserSettingsRequest]);
        }
      });

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update'
        });
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(userId);

      await executeSingle(
        `UPDATE user_settings SET ${updateFields.join(', ')} WHERE user_id = ?`,
        updateValues
      );

      // Fetch updated settings
      const updatedSettings = await executeQuery<UserSettings>(
        'SELECT * FROM user_settings WHERE user_id = ?',
        [userId]
      );

      res.json({
        success: true,
        data: updatedSettings[0],
        message: 'Settings updated successfully'
      });
    } catch (error) {
      console.error('Update settings error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
);

// POST /api/settings/reset - Reset settings to defaults
router.post('/reset',
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;

      // Delete existing settings (will trigger recreation with defaults)
      await executeSingle(
        'DELETE FROM user_settings WHERE user_id = ?',
        [userId]
      );

      // Create new default settings
      await executeSingle(
        'INSERT INTO user_settings (user_id) VALUES (?)',
        [userId]
      );

      // Fetch the new settings
      const newSettings = await executeQuery<UserSettings>(
        'SELECT * FROM user_settings WHERE user_id = ?',
        [userId]
      );

      res.json({
        success: true,
        data: newSettings[0],
        message: 'Settings reset to defaults successfully'
      });
    } catch (error) {
      console.error('Reset settings error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
);

// GET /api/settings/accounts - Get available accounts for settings
router.get('/accounts',
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;

      const accounts = await executeQuery<{
        id: number;
        name: string;
        type: string;
        currency: string;
        is_active: boolean;
      }>(`
        SELECT id, name, type, currency, is_active 
        FROM accounts 
        WHERE user_id = ? AND is_active = 1
        ORDER BY name ASC
      `, [userId]);

      res.json({
        success: true,
        data: accounts
      });
    } catch (error) {
      console.error('Get settings accounts error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
);

// GET /api/settings/export - Export user settings
router.get('/export',
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;

      const settings = await executeQuery<UserSettings>(
        'SELECT * FROM user_settings WHERE user_id = ?',
        [userId]
      );

      if (settings.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Settings not found'
        });
      }

      // Remove sensitive fields
      const exportData = {
        ...settings[0],
        id: undefined,
        user_id: undefined,
        created_at: undefined,
        updated_at: undefined
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="tradeprop-settings.json"');
      res.json({
        success: true,
        data: exportData,
        exported_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Export settings error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
);

// POST /api/settings/import - Import user settings
router.post('/import',
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const importData = req.body;

      // Validate import data structure
      if (!importData || typeof importData !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'Invalid import data format'
        });
      }

      // Filter only valid settings fields
      const validFields = [
        'default_lot_size', 'default_risk_percentage', 'default_account_id',
        'default_timeframe', 'auto_calculate_position_size', 'enforce_risk_limits',
        'max_risk_per_trade', 'max_daily_risk', 'default_tags', 'theme',
        'notifications_enabled'
      ];

      const updateData: Partial<UpdateUserSettingsRequest> = {};
      validFields.forEach(field => {
        if (importData[field] !== undefined) {
          updateData[field as keyof UpdateUserSettingsRequest] = importData[field];
        }
      });

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No valid settings found in import data'
        });
      }

      // Validate default_account_id if provided
      if (updateData.default_account_id) {
        const accounts = await executeQuery(
          'SELECT id FROM accounts WHERE id = ? AND user_id = ? AND is_active = 1',
          [updateData.default_account_id, userId]
        );

        if (accounts.length === 0) {
          // Remove invalid account ID
          delete updateData.default_account_id;
        }
      }

      // Check if settings exist
      const existingSettings = await executeQuery<UserSettings>(
        'SELECT * FROM user_settings WHERE user_id = ?',
        [userId]
      );

      if (existingSettings.length === 0) {
        // Create settings first
        await executeSingle(
          'INSERT INTO user_settings (user_id) VALUES (?)',
          [userId]
        );
      }

      // Build update query
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof UpdateUserSettingsRequest] !== undefined) {
          updateFields.push(`${key} = ?`);
          updateValues.push(updateData[key as keyof UpdateUserSettingsRequest]);
        }
      });

      if (updateFields.length > 0) {
        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        updateValues.push(userId);

        await executeSingle(
          `UPDATE user_settings SET ${updateFields.join(', ')} WHERE user_id = ?`,
          updateValues
        );
      }

      // Fetch updated settings
      const updatedSettings = await executeQuery<UserSettings>(
        'SELECT * FROM user_settings WHERE user_id = ?',
        [userId]
      );

      res.json({
        success: true,
        data: updatedSettings[0],
        message: 'Settings imported successfully'
      });
    } catch (error) {
      console.error('Import settings error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
);

export default router; 