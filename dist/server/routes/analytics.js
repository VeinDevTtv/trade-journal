"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("@/middleware/auth");
const database_1 = require("@/config/database");
const router = (0, express_1.Router)();
// GET /api/analytics - Get comprehensive analytics data
router.get('/', auth_1.verifyToken, [
    (0, express_validator_1.query)('date_from').optional().isISO8601().withMessage('date_from must be a valid date'),
    (0, express_validator_1.query)('date_to').optional().isISO8601().withMessage('date_to must be a valid date'),
    (0, express_validator_1.query)('account_id').optional().isInt({ min: 1 }).withMessage('Account ID must be a positive integer')
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
        // Build WHERE clause for filtering
        let whereClause = 'WHERE user_id = ?';
        const params = [userId];
        if (req.query.date_from) {
            whereClause += ' AND trade_date >= ?';
            params.push(req.query.date_from);
        }
        if (req.query.date_to) {
            whereClause += ' AND trade_date <= ?';
            params.push(req.query.date_to);
        }
        if (req.query.account_id) {
            whereClause += ' AND account_id = ?';
            params.push(req.query.account_id);
        }
        // Get basic statistics
        const basicStats = await (0, database_1.executeQuery)(`
        SELECT 
          COUNT(*) as total_trades,
          SUM(CASE WHEN is_win = 1 THEN 1 ELSE 0 END) as winning_trades,
          SUM(CASE WHEN is_win = 0 THEN 1 ELSE 0 END) as losing_trades,
          SUM(profit) as total_profit
        FROM trades 
        ${whereClause}
      `, params);
        const stats = basicStats[0];
        const winRate = stats.total_trades > 0 ? (stats.winning_trades / stats.total_trades) * 100 : 0;
        // Get best trading day
        const bestDayResult = await (0, database_1.executeQuery)(`
        SELECT 
          trade_date as date,
          SUM(profit) as profit,
          COUNT(*) as trades
        FROM trades 
        ${whereClause}
        GROUP BY trade_date
        ORDER BY profit DESC
        LIMIT 1
      `, params);
        const bestDay = bestDayResult.length > 0 ? bestDayResult[0] : {
            date: new Date().toISOString().split('T')[0],
            profit: 0,
            trades: 0
        };
        // Get profit by symbol
        const profitBySymbol = await (0, database_1.executeQuery)(`
        SELECT 
          symbol,
          SUM(profit) as profit,
          COUNT(*) as trades
        FROM trades 
        ${whereClause}
        GROUP BY symbol
        ORDER BY profit DESC
      `, params);
        // Get profit by day for the last 30 days
        const profitByDay = await (0, database_1.executeQuery)(`
        SELECT 
          DATE_FORMAT(trade_date, '%Y-%m-%d') as day,
          SUM(profit) as profit,
          COUNT(*) as trades
        FROM trades 
        ${whereClause}
        AND trade_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY trade_date
        ORDER BY trade_date ASC
      `, params);
        // Get equity curve (cumulative profit over time)
        const equityCurveData = await (0, database_1.executeQuery)(`
        SELECT 
          DATE_FORMAT(trade_date, '%Y-%m-%d') as date,
          SUM(profit) as daily_profit
        FROM trades 
        ${whereClause}
        GROUP BY trade_date
        ORDER BY trade_date ASC
      `, params);
        // Calculate cumulative equity
        let cumulativeEquity = 0;
        const equityCurve = equityCurveData.map(day => {
            cumulativeEquity += day.daily_profit;
            return {
                date: day.date,
                equity: cumulativeEquity
            };
        });
        // Get monthly performance
        const monthlyPerformance = await (0, database_1.executeQuery)(`
        SELECT 
          DATE_FORMAT(trade_date, '%Y-%m') as month,
          SUM(profit) as profit,
          COUNT(*) as trades,
          SUM(CASE WHEN is_win = 1 THEN 1 ELSE 0 END) as winning_trades
        FROM trades 
        ${whereClause}
        GROUP BY DATE_FORMAT(trade_date, '%Y-%m')
        ORDER BY month DESC
        LIMIT 12
      `, params);
        // Calculate win rate for each month
        const monthlyPerformanceWithWinRate = monthlyPerformance.map(month => ({
            ...month,
            win_rate: month.trades > 0 ? (month.winning_trades / month.trades) * 100 : 0
        }));
        const analyticsData = {
            total_trades: stats.total_trades,
            winning_trades: stats.winning_trades,
            losing_trades: stats.losing_trades,
            win_rate: winRate,
            total_profit: stats.total_profit,
            best_day: bestDay,
            profit_by_symbol: profitBySymbol,
            profit_by_day: profitByDay,
            equity_curve: equityCurve,
            monthly_performance: monthlyPerformanceWithWinRate
        };
        const response = {
            success: true,
            data: analyticsData
        };
        res.json(response);
    }
    catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
// GET /api/analytics/summary - Get quick summary stats
router.get('/summary', auth_1.verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const summary = await (0, database_1.executeQuery)(`
        SELECT 
          COUNT(*) as total_trades,
          SUM(profit) as total_profit,
          ROUND(
            (SUM(CASE WHEN is_win = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 
            2
          ) as win_rate,
          COALESCE(
            (SELECT MAX(daily_profit) 
             FROM (
               SELECT SUM(profit) as daily_profit 
               FROM trades 
               WHERE user_id = ? 
               GROUP BY trade_date
             ) as daily_totals), 
            0
          ) as best_day_profit
        FROM trades 
        WHERE user_id = ?
      `, [userId, userId]);
        res.json({
            success: true,
            data: summary[0] || {
                total_trades: 0,
                total_profit: 0,
                win_rate: 0,
                best_day_profit: 0
            }
        });
    }
    catch (error) {
        console.error('Summary analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
// GET /api/analytics/calendar - Get calendar data for trade activity
router.get('/calendar', auth_1.verifyToken, [
    (0, express_validator_1.query)('year').optional().isInt({ min: 2020, max: 2030 }).withMessage('Year must be between 2020 and 2030'),
    (0, express_validator_1.query)('month').optional().isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12')
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
        const year = req.query.year || new Date().getFullYear();
        const month = req.query.month || new Date().getMonth() + 1;
        const calendarData = await (0, database_1.executeQuery)(`
        SELECT 
          DAY(trade_date) as day,
          SUM(profit) as profit,
          COUNT(*) as trades,
          SUM(profit) > 0 as win
        FROM trades 
        WHERE user_id = ? 
        AND YEAR(trade_date) = ? 
        AND MONTH(trade_date) = ?
        GROUP BY DAY(trade_date)
        ORDER BY day ASC
      `, [userId, year, month]);
        res.json({
            success: true,
            data: calendarData
        });
    }
    catch (error) {
        console.error('Calendar analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
// GET /api/analytics/performance-by-symbol - Get detailed performance by trading symbol
router.get('/performance-by-symbol', auth_1.verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const symbolPerformance = await (0, database_1.executeQuery)(`
        SELECT 
          symbol,
          COUNT(*) as total_trades,
          SUM(CASE WHEN is_win = 1 THEN 1 ELSE 0 END) as winning_trades,
          SUM(CASE WHEN is_win = 0 THEN 1 ELSE 0 END) as losing_trades,
          SUM(profit) as total_profit,
          AVG(profit) as average_profit,
          ROUND((SUM(CASE WHEN is_win = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as win_rate,
          SUM(pips) as total_pips,
          AVG(pips) as average_pips
        FROM trades 
        WHERE user_id = ?
        GROUP BY symbol
        ORDER BY total_profit DESC
      `, [userId]);
        res.json({
            success: true,
            data: symbolPerformance
        });
    }
    catch (error) {
        console.error('Symbol performance error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
// GET /api/analytics/risk-metrics - Get risk management metrics
router.get('/risk-metrics', auth_1.verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const riskMetrics = await (0, database_1.executeQuery)(`
        SELECT 
          AVG(CASE WHEN rrr IS NOT NULL THEN rrr END) as average_rrr,
          ABS(MIN(profit)) as largest_loss,
          MAX(profit) as largest_win,
          AVG(CASE WHEN profit > 0 THEN profit END) as average_win,
          AVG(CASE WHEN profit < 0 THEN ABS(profit) END) as average_loss,
          CASE 
            WHEN SUM(CASE WHEN profit < 0 THEN ABS(profit) END) > 0 
            THEN SUM(CASE WHEN profit > 0 THEN profit END) / SUM(CASE WHEN profit < 0 THEN ABS(profit) END)
            ELSE 0 
          END as profit_factor
        FROM trades 
        WHERE user_id = ?
      `, [userId]);
        // Calculate max drawdown (simplified version)
        const equityData = await (0, database_1.executeQuery)(`
        SELECT 
          trade_date as date,
          SUM(profit) OVER (ORDER BY trade_date, trade_time) as cumulative_profit
        FROM trades 
        WHERE user_id = ?
        ORDER BY trade_date, trade_time
      `, [userId]);
        let maxDrawdown = 0;
        let peak = 0;
        for (const point of equityData) {
            if (point.cumulative_profit > peak) {
                peak = point.cumulative_profit;
            }
            const drawdown = peak - point.cumulative_profit;
            if (drawdown > maxDrawdown) {
                maxDrawdown = drawdown;
            }
        }
        const metrics = riskMetrics[0] || {
            average_rrr: 0,
            max_drawdown: 0,
            largest_win: 0,
            largest_loss: 0,
            average_win: 0,
            average_loss: 0,
            profit_factor: 0
        };
        metrics.max_drawdown = maxDrawdown;
        res.json({
            success: true,
            data: metrics
        });
    }
    catch (error) {
        console.error('Risk metrics error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=analytics.js.map