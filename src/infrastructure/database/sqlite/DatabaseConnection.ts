import sqlite3 from 'sqlite3';

export class DatabaseConnection {
    private static instance: DatabaseConnection;
    private readonly db: sqlite3.Database;

    private constructor() {
        this.db = new sqlite3.Database('./database.sqlite', (err) => {
            if (err) {
                console.error('Erro ao conectar com o banco de dados:', err);
                throw err;
            } else {
                console.log('Conectado ao banco SQLite');
                this.enableForeignKeys();
            }
        });
    }

    public static getInstance(): DatabaseConnection {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }

    public getDatabase(): sqlite3.Database {
        return this.db;
    }

    private enableForeignKeys(): void {
        this.db.run('PRAGMA foreign_keys = ON');
    }

    public close(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('Conexão com o banco fechada');
                    resolve();
                }
            });
        });
    }

    public runAsync(sql: string, params: any[] = []): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    public getAsync(sql: string, params: any[] = []): Promise<any> {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    public allAsync(sql: string, params: any[] = []): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows || []);
                }
            });
        });
    }
}