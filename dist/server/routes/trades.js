"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_1 = require("@/middleware/auth");
const database_1 = require("@/config/database");
const router = (0, express_1.Router)();
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = process.env.UPLOAD_PATH || 'uploads/';
        if (!fs_1.default.existsSync(uploadPath)) {
            fs_1.default.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `trade-${uniqueSuffix}${path_1.default.extname(file.originalname)}`);
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880') // 5MB default
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    }
});
// Validation rules
const createTradeValidation = [
    (0, express_validator_1.body)('symbol').notEmpty().withMessage('Symbol is required'),
    (0, express_validator_1.body)('direction').isIn(['Buy', 'Sell']).withMessage('Direction must be Buy or Sell'),
    (0, express_validator_1.body)('entry_price').isFloat({ min: 0 }).withMessage('Entry price must be a positive number'),
    (0, express_validator_1.body)('exit_price').isFloat({ min: 0 }).withMessage('Exit price must be a positive number'),
    (0, express_validator_1.body)('volume').isFloat({ min: 0 }).withMessage('Volume must be a positive number'),
    (0, express_validator_1.body)('account_id').isInt({ min: 1 }).withMessage('Account ID must be a positive integer'),
    (0, express_validator_1.body)('trade_date').isISO8601().withMessage('Trade date must be a valid date'),
    (0, express_validator_1.body)('trade_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Trade time must be in HH:MM format'),
    (0, express_validator_1.body)('stop_loss').optional().isFloat({ min: 0 }).withMessage('Stop loss must be a positive number'),
    (0, express_validator_1.body)('take_profit').optional().isFloat({ min: 0 }).withMessage('Take profit must be a positive number'),
    (0, express_validator_1.body)('notes').optional().isLength({ max: 2000 }).withMessage('Notes must be less than 2000 characters'),
    (0, express_validator_1.body)('tags').optional().isArray().withMessage('Tags must be an array'),
    (0, express_validator_1.body)('tags.*').optional().isLength({ max: 100 }).withMessage('Each tag must be less than 100 characters')
];
const updateTradeValidation = [
    (0, express_validator_1.param)('id').isInt({ min: 1 }).withMessage('Trade ID must be a positive integer'),
    ...createTradeValidation.map(rule => rule.optional())
];
// Helper function to calculate trade metrics
async function calculateTradeMetrics(symbol, direction, entryPrice, exitPrice, volume, stopLoss, takeProfit) {
    // Import calculation functions from the existing lib
    const { calculateProfit, calculateRRR } = await Promise.resolve().then(() => __importStar(require('../lib/trade-calculations')));
    const profitData = await calculateProfit(symbol, direction, entryPrice, exitPrice, volume);
    let rrr = null;
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
router.get('/', auth_1.verifyToken, [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('symbol').optional().isString().withMessage('Symbol must be a string'),
    (0, express_validator_1.query)('direction').optional().isIn(['Buy', 'Sell']).withMessage('Direction must be Buy or Sell'),
    (0, express_validator_1.query)('is_win').optional().isBoolean().withMessage('is_win must be a boolean'),
    (0, express_validator_1.query)('account_id').optional().isInt({ min: 1 }).withMessage('Account ID must be a positive integer'),
    (0, express_validator_1.query)('date_from').optional().isISO8601().withMessage('date_from must be a valid date'),
    (0, express_validator_1.query)('date_to').optional().isISO8601().withMessage('date_to must be a valid date')
], async (req, res) => {
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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        // Build WHERE clause based on filters
        let whereClause = 'WHERE t.user_id = ?';
        const params = [userId];
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
        const countResult = await (0, database_1.executeQuery)(countQuery, params);
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
        const trades = await (0, database_1.executeQuery)(tradesQuery, [...params, limit, offset]);
        // Process tags
        const processedTrades = trades.map(trade => ({
            ...trade,
            tags: trade.tags ? trade.tags.split(',') : []
        }));
        const response = {
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
    }
    catch (error) {
        console.error('Get trades error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
// GET /api/trades/:id - Get single trade
router.get('/:id', auth_1.verifyToken, [(0, express_validator_1.param)('id').isInt({ min: 1 }).withMessage('Trade ID must be a positive integer')], async (req, res) => {
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
        const tradeId = parseInt(req.params.id);
        const trades = await (0, database_1.executeQuery)(`
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
            tags: trades[0].tags ? trades[0].tags.split(',') : []
        };
        res.json({
            success: true,
            data: trade
        });
    }
    catch (error) {
        console.error('Get trade error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
// POST /api/trades - Create new trade
router.post('/', auth_1.verifyToken, upload.single('screenshot'), createTradeValidation, async (req, res) => {
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
        const { symbol, direction, entry_price, exit_price, stop_loss, take_profit, volume, account_id, trade_date, trade_time, notes, tags } = req.body;
        // Verify account belongs to user
        const accounts = await (0, database_1.executeQuery)('SELECT id FROM accounts WHERE id = ? AND user_id = ?', [account_id, userId]);
        if (accounts.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid account ID'
            });
        }
        // Calculate trade metrics
        const metrics = await calculateTradeMetrics(symbol, direction, parseFloat(entry_price.toString()), parseFloat(exit_price.toString()), parseFloat(volume.toString()), stop_loss ? parseFloat(stop_loss.toString()) : undefined, take_profit ? parseFloat(take_profit.toString()) : undefined);
        const screenshotUrl = req.file ? `/uploads/${req.file.filename}` : null;
        // Insert trade and tags in transaction
        const result = await (0, database_1.executeTransaction)(async (connection) => {
            // Insert trade
            const [tradeResult] = await connection.execute(`INSERT INTO trades (
            user_id, account_id, symbol, direction, entry_price, exit_price,
            stop_loss, take_profit, volume, profit, pips, pip_value, rrr,
            is_win, trade_date, trade_time, notes, screenshot_url
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                userId, account_id, symbol, direction, entry_price, exit_price,
                stop_loss, take_profit, volume, metrics.profit, metrics.pips,
                metrics.pip_value, metrics.rrr, metrics.is_win, trade_date,
                trade_time, notes, screenshotUrl
            ]);
            const tradeId = tradeResult.insertId;
            // Insert tags if provided
            if (tags && tags.length > 0) {
                for (const tag of tags) {
                    await connection.execute('INSERT INTO trade_tags (trade_id, tag) VALUES (?, ?)', [tradeId, tag]);
                }
            }
            return tradeId;
        });
        res.status(201).json({
            success: true,
            data: { id: result },
            message: 'Trade created successfully'
        });
    }
    catch (error) {
        console.error('Create trade error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
// PUT /api/trades/:id - Update trade
router.put('/:id', auth_1.verifyToken, upload.single('screenshot'), updateTradeValidation, async (req, res) => {
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
        const tradeId = parseInt(req.params.id);
        // Check if trade exists and belongs to user
        const existingTrades = await (0, database_1.executeQuery)('SELECT * FROM trades WHERE id = ? AND user_id = ?', [tradeId, userId]);
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
            const accounts = await (0, database_1.executeQuery)('SELECT id FROM accounts WHERE id = ? AND user_id = ?', [updateData.account_id, userId]);
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
            metrics = await calculateTradeMetrics(symbol, direction, parseFloat(entryPrice.toString()), parseFloat(exitPrice.toString()), parseFloat(volume.toString()), stopLoss ? parseFloat(stopLoss.toString()) : undefined, takeProfit ? parseFloat(takeProfit.toString()) : undefined);
        }
        const screenshotUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
        await (0, database_1.executeTransaction)(async (connection) => {
            // Build update query dynamically
            const updateFields = [];
            const updateValues = [];
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
                await connection.execute(`UPDATE trades SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);
            }
            // Update tags if provided
            if (updateData.tags) {
                // Delete existing tags
                await connection.execute('DELETE FROM trade_tags WHERE trade_id = ?', [tradeId]);
                // Insert new tags
                for (const tag of updateData.tags) {
                    await connection.execute('INSERT INTO trade_tags (trade_id, tag) VALUES (?, ?)', [tradeId, tag]);
                }
            }
        });
        res.json({
            success: true,
            message: 'Trade updated successfully'
        });
    }
    catch (error) {
        console.error('Update trade error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
// DELETE /api/trades/:id - Delete trade
router.delete('/:id', auth_1.verifyToken, [(0, express_validator_1.param)('id').isInt({ min: 1 }).withMessage('Trade ID must be a positive integer')], async (req, res) => {
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
        const tradeId = parseInt(req.params.id);
        // Check if trade exists and get screenshot URL for cleanup
        const trades = await (0, database_1.executeQuery)('SELECT screenshot_url FROM trades WHERE id = ? AND user_id = ?', [tradeId, userId]);
        if (trades.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Trade not found'
            });
        }
        const trade = trades[0];
        // Delete trade (tags will be deleted by CASCADE)
        await (0, database_1.executeSingle)('DELETE FROM trades WHERE id = ? AND user_id = ?', [tradeId, userId]);
        // Delete screenshot file if exists
        if (trade.screenshot_url) {
            const filePath = path_1.default.join(process.cwd(), trade.screenshot_url);
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
        }
        res.json({
            success: true,
            message: 'Trade deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete trade error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=trades.js.map