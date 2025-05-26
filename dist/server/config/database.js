"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.testConnection = testConnection;
exports.executeQuery = executeQuery;
exports.executeSingle = executeSingle;
exports.executeTransaction = executeTransaction;
const promise_1 = __importDefault(require("mysql2/promise"));
const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tradeprop_journal',
};
// Create connection pool for better performance
exports.pool = promise_1.default.createPool({
    ...config,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
// Test database connection
async function testConnection() {
    try {
        const connection = await exports.pool.getConnection();
        await connection.ping();
        connection.release();
        console.log('✅ Database connection successful');
        return true;
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
}
// Execute query with error handling
async function executeQuery(query, params = []) {
    try {
        const [rows] = await exports.pool.execute(query, params);
        return rows;
    }
    catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}
// Execute single query (for INSERT, UPDATE, DELETE)
async function executeSingle(query, params = []) {
    try {
        const [result] = await exports.pool.execute(query, params);
        return result;
    }
    catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}
// Transaction helper
async function executeTransaction(callback) {
    const connection = await exports.pool.getConnection();
    try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
    }
    catch (error) {
        await connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
}
exports.default = exports.pool;
//# sourceMappingURL=database.js.map