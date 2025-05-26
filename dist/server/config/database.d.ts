import mysql from 'mysql2/promise';
export declare const pool: mysql.Pool;
export declare function testConnection(): Promise<boolean>;
export declare function executeQuery<T = any>(query: string, params?: any[]): Promise<T[]>;
export declare function executeSingle(query: string, params?: any[]): Promise<mysql.ResultSetHeader>;
export declare function executeTransaction<T>(callback: (connection: mysql.PoolConnection) => Promise<T>): Promise<T>;
export default pool;
//# sourceMappingURL=database.d.ts.map