"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("@/middleware/auth"));
const auth_2 = require("@/middleware/auth");
const database_1 = require("@/config/database");
const router = (0, express_1.Router)();
// GET /api/auth/discord - Initiate Discord OAuth
router.get('/discord', auth_1.default.authenticate('discord'));
// GET /api/auth/discord/callback - Discord OAuth callback
router.get('/discord/callback', auth_1.default.authenticate('discord', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed` }), async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user`);
        }
        // Generate JWT token
        const token = (0, auth_2.generateToken)(user);
        // Redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    }
    catch (error) {
        console.error('Discord callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
    }
});
// GET /api/auth/me - Get current user profile
router.get('/me', auth_2.verifyToken, async (req, res) => {
    try {
        const user = req.user;
        // Get user with additional data
        const userData = await (0, database_1.executeQuery)(`
        SELECT 
          u.*,
          COALESCE(t.total_trades, 0) as total_trades,
          COALESCE(t.total_profit, 0) as total_profit,
          COALESCE(a.accounts_count, 0) as accounts_count
        FROM users u
        LEFT JOIN (
          SELECT 
            user_id,
            COUNT(*) as total_trades,
            SUM(profit) as total_profit
          FROM trades
          GROUP BY user_id
        ) t ON u.id = t.user_id
        LEFT JOIN (
          SELECT 
            user_id,
            COUNT(*) as accounts_count
          FROM accounts
          WHERE is_active = 1
          GROUP BY user_id
        ) a ON u.id = a.user_id
        WHERE u.id = ?
      `, [user.id]);
        if (userData.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        const response = {
            success: true,
            data: userData[0]
        };
        res.json(response);
    }
    catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
// POST /api/auth/logout - Logout user
router.post('/logout', auth_2.verifyToken, (req, res) => {
    try {
        // Destroy session if using sessions
        req.logout((err) => {
            if (err) {
                console.error('Logout error:', err);
            }
        });
        // Clear session
        if (req.session) {
            req.session.destroy((err) => {
                if (err) {
                    console.error('Session destroy error:', err);
                }
            });
        }
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
// GET /api/auth/status - Check authentication status
router.get('/status', (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.json({
            success: true,
            data: {
                authenticated: false,
                user: null
            }
        });
    }
    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        (0, database_1.executeQuery)('SELECT * FROM users WHERE id = ?', [decoded.userId])
            .then(users => {
            if (users.length === 0) {
                return res.json({
                    success: true,
                    data: {
                        authenticated: false,
                        user: null
                    }
                });
            }
            res.json({
                success: true,
                data: {
                    authenticated: true,
                    user: users[0]
                }
            });
        })
            .catch(() => {
            res.json({
                success: true,
                data: {
                    authenticated: false,
                    user: null
                }
            });
        });
    }
    catch (error) {
        res.json({
            success: true,
            data: {
                authenticated: false,
                user: null
            }
        });
    }
});
// DELETE /api/auth/account - Delete user account
router.delete('/account', auth_2.verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        // Delete user account (CASCADE will handle related data)
        await (0, database_1.executeQuery)('DELETE FROM users WHERE id = ?', [userId]);
        res.json({
            success: true,
            message: 'Account deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map