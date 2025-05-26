import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import { JWTPayload, User, DiscordProfile } from '@/types';
import { executeQuery, executeSingle } from '@/config/database';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface User {
      id: number;
      discord_id: string;
      username: string;
      discriminator: string;
      avatar?: string;
      email?: string;
      created_at: Date;
      updated_at: Date;
    }
    interface Request {
      user?: User;
    }
  }
}

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Configure Discord OAuth strategy
passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID!,
  clientSecret: process.env.DISCORD_CLIENT_SECRET!,
  callbackURL: process.env.DISCORD_CALLBACK_URL!,
  scope: ['identify', 'email']
}, async (accessToken: string, refreshToken: string, profile: DiscordProfile, done: any) => {
  try {
    // Check if user exists
    const existingUsers = await executeQuery<User>(
      'SELECT * FROM users WHERE discord_id = ?',
      [profile.id]
    );

    if (existingUsers.length > 0) {
      // Update existing user
      await executeSingle(
        `UPDATE users SET 
         username = ?, 
         discriminator = ?, 
         avatar = ?, 
         email = ?, 
         updated_at = CURRENT_TIMESTAMP 
         WHERE discord_id = ?`,
        [
          profile.username,
          profile.discriminator,
          profile.avatar,
          profile.email,
          profile.id
        ]
      );
      
      return done(null, existingUsers[0]);
    } else {
      // Create new user
      const result = await executeSingle(
        `INSERT INTO users (discord_id, username, discriminator, avatar, email) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          profile.id,
          profile.username,
          profile.discriminator,
          profile.avatar,
          profile.email
        ]
      );

      // Create default account for new user
      await executeSingle(
        `INSERT INTO accounts (user_id, name, type, balance, currency) 
         VALUES (?, ?, ?, ?, ?)`,
        [result.insertId, 'Demo Account', 'Demo Account', 10000, 'USD']
      );

      // Create default settings for new user
      await executeSingle(
        `INSERT INTO user_settings (user_id) VALUES (?)`,
        [result.insertId]
      );

      const newUser: User = {
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
  } catch (error) {
    console.error('Discord OAuth error:', error);
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: number, done) => {
  try {
    const users = await executeQuery<User>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    
    if (users.length > 0) {
      done(null, users[0]);
    } else {
      done(null, false);
    }
  } catch (error) {
    done(error, null);
  }
});

// Generate JWT token
export function generateToken(user: User): string {
  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId: user.id,
    discordId: user.discord_id,
    username: user.username
  };

  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
  } as jwt.SignOptions);
}

// Verify JWT token middleware
export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    // Fetch user from database
    executeQuery<User>('SELECT * FROM users WHERE id = ?', [decoded.userId])
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
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
}

// Optional authentication middleware (doesn't fail if no token)
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    executeQuery<User>('SELECT * FROM users WHERE id = ?', [decoded.userId])
      .then(users => {
        if (users.length > 0) {
          req.user = users[0];
        }
        next();
      })
      .catch(() => {
        next(); // Continue without user if error
      });
  } catch (error) {
    next(); // Continue without user if token invalid
  }
}

export default passport; 