"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.optionalAuth = optionalAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const passport_1 = __importDefault(require("passport"));
const passport_discord_1 = require("passport-discord");
const database_1 = require("@/config/database");
// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
// Configure Discord OAuth strategy
passport_1.default.use(new passport_discord_1.Strategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_CALLBACK_URL,
    scope: ['identify', 'email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user exists
        const existingUsers = await (0, database_1.executeQuery)('SELECT * FROM users WHERE discord_id = ?', [profile.id]);
        if (existingUsers.length > 0) {
            // Update existing user
            await (0, database_1.executeSingle)(`UPDATE users SET 
         username = ?, 
         discriminator = ?, 
         avatar = ?, 
         email = ?, 
         updated_at = CURRENT_TIMESTAMP 
         WHERE discord_id = ?`, [
                profile.username,
                profile.discriminator,
                profile.avatar,
                profile.email,
                profile.id
            ]);
            return done(null, existingUsers[0]);
        }
        else {
            // Create new user
            const result = await (0, database_1.executeSingle)(`INSERT INTO users (discord_id, username, discriminator, avatar, email) 
         VALUES (?, ?, ?, ?, ?)`, [
                profile.id,
                profile.username,
                profile.discriminator,
                profile.avatar,
                profile.email
            ]);
            // Create default account for new user
            await (0, database_1.executeSingle)(`INSERT INTO accounts (user_id, name, type, balance, currency) 
         VALUES (?, ?, ?, ?, ?)`, [result.insertId, 'Demo Account', 'Demo Account', 10000, 'USD']);
            // Create default settings for new user
            await (0, database_1.executeSingle)(`INSERT INTO user_settings (user_id) VALUES (?)`, [result.insertId]);
            const newUser = {
                id: result.insertId,
                discord_id: profile.id,
                username: profile.username,
                discriminator: profile.discriminator,
                avatar: profile.avatar,
                email: profile.email,
                created_at: new Date(),
                updated_at: new Date()
            };
            return done(null, newUser);
        }
    }
    catch (error) {
        console.error('Discord OAuth error:', error);
        return done(error, null);
    }
}));
// Serialize user for session
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
// Deserialize user from session
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const users = await (0, database_1.executeQuery)('SELECT * FROM users WHERE id = ?', [id]);
        if (users.length > 0) {
            done(null, users[0]);
        }
        else {
            done(null, false);
        }
    }
    catch (error) {
        done(error, null);
    }
});
// Generate JWT token
function generateToken(user) {
    const payload = {
        userId: user.id,
        discordId: user.discord_id,
        username: user.username
    };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
}
// Verify JWT token middleware
function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Access token required'
        });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Fetch user from database
        (0, database_1.executeQuery)('SELECT * FROM users WHERE id = ?', [decoded.userId])
            .then(users => {
            if (users.length === 0) {
                return res.status(401).json({
                    success: false,
                    error: 'User not found'
                });
            }
            req.user = users[0];
            next();
        })
            .catch(error => {
            console.error('Token verification error:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        });
    }
    catch (error) {
        return res.status(403).json({
            success: false,
            error: 'Invalid or expired token'
        });
    }
}
// Optional authentication middleware (doesn't fail if no token)
function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return next();
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        (0, database_1.executeQuery)('SELECT * FROM users WHERE id = ?', [decoded.userId])
            .then(users => {
            if (users.length > 0) {
                req.user = users[0];
            }
            next();
        })
            .catch(() => {
            next(); // Continue without user if error
        });
    }
    catch (error) {
        next(); // Continue without user if token invalid
    }
}
exports.default = passport_1.default;
//# sourceMappingURL=auth.js.map