import dotenv from 'dotenv';
import { pool, testConnection, executeSingle } from '../config/database';

// Load environment variables
dotenv.config();

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }

    // Sample user data (Discord user)
    const sampleUser = {
      discord_id: '123456789012345678',
      username: 'SampleTrader',
      discriminator: '1234',
      avatar: 'sample_avatar_hash',
      email: 'sample@example.com'
    };

    // Insert sample user
    console.log('Creating sample user...');
    const userResult = await executeSingle(
      `INSERT INTO users (discord_id, username, discriminator, avatar, email) 
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       username = VALUES(username),
       discriminator = VALUES(discriminator),
       avatar = VALUES(avatar),
       email = VALUES(email)`,
      [
        sampleUser.discord_id,
        sampleUser.username,
        sampleUser.discriminator,
        sampleUser.avatar,
        sampleUser.email
      ]
    );

    const userId = userResult.insertId || 1; // Use 1 if user already exists

    // Sample accounts
    const sampleAccounts = [
      {
        name: 'FTMO Challenge $100K',
        type: 'FTMO Challenge',
        balance: 100000,
        currency: 'USD'
      },
      {
        name: 'Demo Account',
        type: 'Demo Account',
        balance: 10000,
        currency: 'USD'
      },
      {
        name: 'Live Account',
        type: 'Live Account',
        balance: 5000,
        currency: 'USD'
      }
    ];

    console.log('Creating sample accounts...');
    const accountIds: number[] = [];
    
    for (const account of sampleAccounts) {
      const accountResult = await executeSingle(
        `INSERT INTO accounts (user_id, name, type, balance, currency) 
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
         balance = VALUES(balance),
         type = VALUES(type)`,
        [userId, account.name, account.type, account.balance, account.currency]
      );
      accountIds.push(accountResult.insertId);
    }

    // Sample trades
    const sampleTrades = [
      {
        symbol: 'EURUSD',
        direction: 'Buy',
        entry_price: 1.0850,
        exit_price: 1.0920,
        stop_loss: 1.0800,
        take_profit: 1.0950,
        volume: 1.00,
        profit: 700.00,
        pips: 70.0,
        pip_value: 10.00,
        rrr: 2.33,
        is_win: true,
        trade_date: '2024-01-15',
        trade_time: '09:30:00',
        notes: 'Strong bullish momentum after ECB announcement',
        tags: ['ECB', 'Breakout', 'Major']
      },
      {
        symbol: 'GBPUSD',
        direction: 'Sell',
        entry_price: 1.2650,
        exit_price: 1.2580,
        stop_loss: 1.2700,
        take_profit: 1.2550,
        volume: 0.50,
        profit: 350.00,
        pips: 70.0,
        pip_value: 5.00,
        rrr: 2.00,
        is_win: true,
        trade_date: '2024-01-16',
        trade_time: '14:15:00',
        notes: 'Brexit concerns weighing on GBP',
        tags: ['Brexit', 'News', 'Major']
      },
      {
        symbol: 'USDJPY',
        direction: 'Buy',
        entry_price: 148.50,
        exit_price: 148.20,
        stop_loss: 148.00,
        take_profit: 149.50,
        volume: 0.75,
        profit: -225.00,
        pips: -30.0,
        pip_value: 7.50,
        rrr: null,
        is_win: false,
        trade_date: '2024-01-17',
        trade_time: '11:45:00',
        notes: 'Stopped out due to BoJ intervention rumors',
        tags: ['BoJ', 'Intervention', 'Major']
      },
      {
        symbol: 'XAUUSD',
        direction: 'Buy',
        entry_price: 2020.50,
        exit_price: 2035.80,
        stop_loss: 2010.00,
        take_profit: 2040.00,
        volume: 0.10,
        profit: 153.00,
        pips: 15.3,
        pip_value: 10.00,
        rrr: 1.86,
        is_win: true,
        trade_date: '2024-01-18',
        trade_time: '16:20:00',
        notes: 'Gold rally on safe haven demand',
        tags: ['Gold', 'SafeHaven', 'Commodity']
      },
      {
        symbol: 'EURUSD',
        direction: 'Sell',
        entry_price: 1.0880,
        exit_price: 1.0830,
        stop_loss: 1.0920,
        take_profit: 1.0820,
        volume: 1.50,
        profit: 750.00,
        pips: 50.0,
        pip_value: 15.00,
        rrr: 1.50,
        is_win: true,
        trade_date: '2024-01-19',
        trade_time: '08:00:00',
        notes: 'Reversal at resistance level',
        tags: ['Resistance', 'Reversal', 'Major']
      }
    ];

    console.log('Creating sample trades...');
    
    for (let i = 0; i < sampleTrades.length; i++) {
      const trade = sampleTrades[i];
      const accountId = accountIds[i % accountIds.length]; // Distribute trades across accounts

      // Insert trade
      const tradeResult = await executeSingle(
        `INSERT INTO trades (
          user_id, account_id, symbol, direction, entry_price, exit_price,
          stop_loss, take_profit, volume, profit, pips, pip_value, rrr,
          is_win, trade_date, trade_time, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId, accountId, trade.symbol, trade.direction, trade.entry_price,
          trade.exit_price, trade.stop_loss, trade.take_profit, trade.volume,
          trade.profit, trade.pips, trade.pip_value, trade.rrr, trade.is_win,
          trade.trade_date, trade.trade_time, trade.notes
        ]
      );

      const tradeId = tradeResult.insertId;

      // Insert tags
      for (const tag of trade.tags) {
        await executeSingle(
          'INSERT INTO trade_tags (trade_id, tag) VALUES (?, ?)',
          [tradeId, tag]
        );
      }
    }

    // Create user settings
    console.log('Creating sample user settings...');
    await executeSingle(
      `INSERT INTO user_settings (
        user_id, default_lot_size, default_risk_percentage, default_account_id,
        default_timeframe, auto_calculate_position_size, enforce_risk_limits,
        max_risk_per_trade, max_daily_risk, default_tags, theme, notifications_enabled
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        default_lot_size = VALUES(default_lot_size),
        default_risk_percentage = VALUES(default_risk_percentage)`,
      [
        userId, 1.00, 2.00, accountIds[0], '1H', true, true,
        5.00, 10.00, 'Scalping,Swing,Breakout', 'dark', true
      ]
    );

    console.log('🎉 Database seeding completed successfully!');
    console.log(`✅ Created sample user with ID: ${userId}`);
    console.log(`✅ Created ${accountIds.length} sample accounts`);
    console.log(`✅ Created ${sampleTrades.length} sample trades`);
    console.log(`✅ Created user settings`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase }; 