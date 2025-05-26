"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("@/middleware/auth");
const database_1 = require("@/config/database");
const router = (0, express_1.Router)();
// Validation rules
const updateSettingsValidation = [
    (0, express_validator_1.body)('default_lot_size').optional().isFloat({ min: 0.01 }).withMessage('Default lot size must be at least 0.01'),
    (0, express_validator_1.body)('default_risk_percentage').optional().isFloat({ min: 0.1, max: 100 }).withMessage('Default risk percentage must be between 0.1 and 100'),
    (0, express_validator_1.body)('default_account_id').optional().isInt({ min: 1 }).withMessage('Default account ID must be a positive integer'),
    (0, express_validator_1.body)('default_timeframe').optional().isString().withMessage('Default timeframe must be a string'),
    (0, express_validator_1.body)('auto_calculate_position_size').optional().isBoolean().withMessage('Auto calculate position size must be a boolean'),
    (0, express_validator_1.body)('enforce_risk_limits').optional().isBoolean().withMessage('Enforce risk limits must be a boolean'),
    (0, express_validator_1.body)('max_risk_per_trade').optional().isFloat({ min: 0.1, max: 100 }).withMessage('Max risk per trade must be between 0.1 and 100'),
    (0, express_validator_1.body)('max_daily_risk').optional().isFloat({ min: 0.1, max: 100 }).withMessage('Max daily risk must be between 0.1 and 100'),
    (0, express_validator_1.body)('default_tags').optional().isString().withMessage('Default tags must be a string'),
    (0, express_validator_1.body)('theme').optional().isIn(['light', 'dark', 'system']).withMessage('Theme must be light, dark, or system'),
    (0, express_validator_1.body)('notifications_enabled').optional().isBoolean().withMessage('Notifications enabled must be a boolean')
];
// GET /api/settings - Get user settings
router.get('/', auth_1.verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const settings = await (0, database_1.executeQuery)(`
        SELECT * FROM user_settings WHERE user_id = ?
      `, [userId]);
        if (settings.length === 0) {
            // Create default settings if they don't exist
            await (0, database_1.executeSingle)('INSERT INTO user_settings (user_id) VALUES (?)', [userId]);
            // Fetch the newly created settings
            const newSettings = await (0, database_1.executeQuery)(`
          SELECT * FROM user_settings WHERE user_id = ?
        `, [userId]);
            return res.json({
                success: true,
                data: newSettings[0]
            });
        }
        const response = {
            success: true,
            data: settings[0]
        };
        res.json(response);
    }
    catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
// PUT /api/settings - Update user settings
router.put('/', auth_1.verifyToken, updateSettingsValidation, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }
        const userId = req.user.id;
        const updateData = req.body;
        // Validate default_account_id belongs to user if provided
        if (updateData.default_account_id) {
            const accounts = await (0, database_1.executeQuery)('SELECT id FROM accounts WHERE id = ? AND user_id = ? AND is_active = 1', [updateData.default_account_id, userId]);
            if (accounts.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid default account ID or account is not active'
                });
            }
        }
        // Check if settings exist
        const existingSettings = await (0, database_1.executeQuery)('SELECT * FROM user_settings WHERE user_id = ?', [userId]);
        if (existingSettings.length === 0) {
            // Create settings first
            await (0, database_1.executeSingle)('INSERT INTO user_settings (user_id) VALUES (?)', [userId]);
        }
        // Build update query dynamically
        const updateFields = [];
        const updateValues = [];
        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined) {
                updateFields.push(`${key} = ?`);
                updateValues.push(updateData[key]);
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
        await (0, database_1.executeSingle)(`UPDATE user_settings SET ${updateFields.join(', ')} WHERE user_id = ?`, updateValues);
        // Fetch updated settings
        const updatedSettings = await (0, database_1.executeQuery)('SELECT * FROM user_settings WHERE user_id = ?', [userId]);
        res.json({
            success: true,
            data: updatedSettings[0],
            message: 'Settings updated successfully'
        });
    }
    catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
// POST /api/settings/reset - Reset settings to defaults
router.post('/reset', auth_1.verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        // Delete existing settings (will trigger recreation with defaults)
        await (0, database_1.executeSingle)('DELETE FROM user_settings WHERE user_id = ?', [userId]);
        // Create new default settings
        await (0, database_1.executeSingle)('INSERT INTO user_settings (user_id) VALUES (?)', [userId]);
        // Fetch the new settings
        const newSettings = await (0, database_1.executeQuery)('SELECT * FROM user_settings WHERE user_id = ?', [userId]);
        res.json({
            success: true,
            data: newSettings[0],
            message: 'Settings reset to defaults successfully'
        });
    }
    catch (error) {
        console.error('Reset settings error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
// GET /api/settings/accounts - Get available accounts for settings
router.get('/accounts', auth_1.verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const accounts = await (0, database_1.executeQuery)(`
        SELECT id, name, type, currency, is_active 
        FROM accounts 
        WHERE user_id = ? AND is_active = 1
        ORDER BY name ASC
      `, [userId]);
        res.json({
            success: true,
            data: accounts
        });
    }
    catch (error) {
        console.error('Get settings accounts error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
// GET /api/settings/export - Export user settings
router.get('/export', auth_1.verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const settings = await (0, database_1.executeQuery)('SELECT * FROM user_settings WHERE user_id = ?', [userId]);
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
    }
    catch (error) {
        console.error('Export settings error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
// POST /api/settings/import - Import user settings
router.post('/import', auth_1.verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
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
        const updateData = {};
        validFields.forEach(field => {
            if (importData[field] !== undefined) {
                updateData[field] = importData[field];
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
            const accounts = await (0, database_1.executeQuery)('SELECT id FROM accounts WHERE id = ? AND user_id = ? AND is_active = 1', [updateData.default_account_id, userId]);
            if (accounts.length === 0) {
                // Remove invalid account ID
                delete updateData.default_account_id;
            }
        }
        // Check if settings exist
        const existingSettings = await (0, database_1.executeQuery)('SELECT * FROM user_settings WHERE user_id = ?', [userId]);
        if (existingSettings.length === 0) {
            // Create settings first
            await (0, database_1.executeSingle)('INSERT INTO user_settings (user_id) VALUES (?)', [userId]);
        }
        // Build update query
        const updateFields = [];
        const updateValues = [];
        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined) {
                updateFields.push(`${key} = ?`);
                updateValues.push(updateData[key]);
            }
        });
        if (updateFields.length > 0) {
            updateFields.push('updated_at = CURRENT_TIMESTAMP');
            updateValues.push(userId);
            await (0, database_1.executeSingle)(`UPDATE user_settings SET ${updateFields.join(', ')} WHERE user_id = ?`, updateValues);
        }
        // Fetch updated settings
        const updatedSettings = await (0, database_1.executeQuery)('SELECT * FROM user_settings WHERE user_id = ?', [userId]);
        res.json({
            success: true,
            data: updatedSettings[0],
            message: 'Settings imported successfully'
        });
    }
    catch (error) {
        console.error('Import settings error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=settings.js.map