# TradeProp Journal - Real Integration Setup Guide

This guide will help you set up the TradeProp Journal application with real backend integration and database connectivity.

## Prerequisites

### Required Software
1. **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
2. **MySQL** (v8.0 or higher) - [Download here](https://dev.mysql.com/downloads/mysql/)
3. **Git** - [Download here](https://git-scm.com/)

### Optional but Recommended
- **MySQL Workbench** - For database management
- **Postman** - For API testing

## Database Setup

### 1. Install MySQL
- Download and install MySQL Server
- During installation, set a root password (remember this!)
- Start the MySQL service

### 2. Create Database
Open MySQL command line or MySQL Workbench and run:
```sql
CREATE DATABASE tradeprop_journal;
```

### 3. Create MySQL User (Optional but recommended)
```sql
CREATE USER 'tradeprop_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON tradeprop_journal.* TO 'tradeprop_user'@'localhost';
FLUSH PRIVILEGES;
```

## Environment Configuration

### 1. Copy Environment File
The `.env` file has been created with default values. Update the following:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root  # or 'tradeprop_user' if you created one
DB_PASSWORD=your_mysql_password
DB_NAME=tradeprop_journal

# JWT Configuration (Generate secure keys)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_development_key_2024
SESSION_SECRET=your_super_secret_session_key_here_make_it_long_and_random_session_key_2024

# Discord OAuth Configuration (Optional - for authentication)
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_CALLBACK_URL=http://localhost:3000/api/auth/discord/callback
```

### 2. Generate Secure Keys
For production, generate secure keys:
```bash
# Generate JWT Secret (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate Session Secret (32+ characters)  
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Discord OAuth Setup (Optional)

If you want to use Discord authentication:

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to OAuth2 settings
4. Add redirect URL: `http://localhost:3000/api/auth/discord/callback`
5. Copy Client ID and Client Secret to your `.env` file

## Installation & Setup

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Run Database Migrations
```bash
npm run db:migrate
```

### 3. Seed Database (Optional)
```bash
npm run db:seed
```

## Running the Application

### Development Mode
Start both frontend and backend:
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Individual Services
Start frontend only:
```bash
npm run dev:frontend
```

Start backend only:
```bash
npm run dev:backend
```

## Verification

### 1. Check Backend Health
Visit: http://localhost:3001/health

You should see:
```json
{
  "success": true,
  "message": "TradeProp Journal API is running",
  "timestamp": "2024-01-XX...",
  "environment": "development"
}
```

### 2. Check Frontend
Visit: http://localhost:3000

You should see the TradeProp Journal dashboard.

### 3. Test Database Connection
The backend will log database connection status on startup.

## Features Now Available

### ✅ Real Data Integration
- Dashboard cards show real analytics from your trades
- Recent trades display actual trade data
- Calendar view shows real trading days
- Performance charts use real analytics data
- Trade journal displays actual trade entries

### ✅ Authentication
- Discord OAuth integration (if configured)
- Session management
- Protected routes

### ✅ Trade Management
- Add, edit, delete trades
- File upload for screenshots
- Tag management
- Real-time profit/loss calculations

### ✅ Analytics
- Equity curve tracking
- Performance by symbol
- Win/loss ratios
- Risk metrics
- Calendar heat map

### ✅ Account Management
- Multiple trading accounts
- Account switching
- Balance tracking

## Troubleshooting

### Database Connection Issues
1. Ensure MySQL is running
2. Check credentials in `.env`
3. Verify database exists
4. Check firewall settings

### Port Conflicts
- Frontend (3000): Change in `next.config.mjs`
- Backend (3001): Change `PORT` in `.env`

### Authentication Issues
1. Verify Discord OAuth settings
2. Check callback URLs
3. Ensure secrets are set correctly

### Build Issues
- Clear node_modules: `rm -rf node_modules && npm install --legacy-peer-deps`
- Clear Next.js cache: `rm -rf .next`

## Production Deployment

### Build Application
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use secure database credentials
- Configure proper CORS origins
- Set up SSL certificates
- Use environment-specific secrets

## API Endpoints

### Authentication
- `GET /api/auth/discord` - Discord OAuth login
- `GET /api/auth/me` - Get user profile
- `POST /api/auth/logout` - Logout

### Trades
- `GET /api/trades` - Get trades (with pagination)
- `POST /api/trades` - Create trade
- `PUT /api/trades/:id` - Update trade
- `DELETE /api/trades/:id` - Delete trade

### Analytics
- `GET /api/analytics` - Get analytics data
- `GET /api/analytics/summary` - Get summary stats
- `GET /api/analytics/calendar` - Get calendar data
- `GET /api/analytics/performance-by-symbol` - Symbol performance
- `GET /api/analytics/risk-metrics` - Risk metrics

### Accounts
- `GET /api/accounts` - Get accounts
- `POST /api/accounts` - Create account
- `PUT /api/accounts/:id` - Update account
- `DELETE /api/accounts/:id` - Delete account

## Support

If you encounter issues:
1. Check the console logs (both frontend and backend)
2. Verify environment configuration
3. Ensure database is properly set up
4. Check network connectivity

The application is now fully integrated with real data and ready for production use! 