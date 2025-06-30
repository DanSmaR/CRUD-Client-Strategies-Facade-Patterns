import { DatabaseConnection } from './DatabaseConnection';

export class DatabaseSchema {
    private dbConnection: DatabaseConnection;

    constructor() {
        this.dbConnection = DatabaseConnection.getInstance();
    }

    public async initializeSchema(): Promise<void> {
        const db = this.dbConnection.getDatabase();

        return new Promise((resolve, reject) => {
            db.serialize(async () => {
                try {
                    await this.createCountriesTable();
                    await this.createStatesTable();
                    await this.createCitiesTable();
                    await this.createAddressesTable();
                    await this.createPhonesTable();
                    await this.createClientsTable();
                    await this.createClientBillingAddressesTable();
                    await this.createClientDeliveryAddressesTable();

                    console.log('Database schema created successfully');
                    resolve();
                } catch (error) {
                    console.error('Erro ao criar schema do banco:', error);
                    reject(error);
                }
            });
        });
    }

    private async createCountriesTable(): Promise<void> {
        const sql = `
      CREATE TABLE IF NOT EXISTS countries (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
        await this.dbConnection.runAsync(sql);
    }

    private async createStatesTable(): Promise<void> {
        const sql = `
      CREATE TABLE IF NOT EXISTS states (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        country_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (country_id) REFERENCES countries (id) ON DELETE CASCADE,
        UNIQUE(name, country_id)
      )
    `;
        await this.dbConnection.runAsync(sql);
    }

    private async createCitiesTable(): Promise<void> {
        const sql = `
      CREATE TABLE IF NOT EXISTS cities (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        state_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (state_id) REFERENCES states (id) ON DELETE CASCADE,
        UNIQUE(name, state_id)
      )
    `;
        await this.dbConnection.runAsync(sql);
    }

    private async createAddressesTable(): Promise<void> {
        const sql = `
      CREATE TABLE IF NOT EXISTS addresses (
        id TEXT PRIMARY KEY,
        residence_type TEXT NOT NULL,
        street_type TEXT NOT NULL,
        street TEXT NOT NULL,
        number TEXT NOT NULL,
        neighborhood TEXT NOT NULL,
        zip_code TEXT NOT NULL,
        city_id TEXT NOT NULL,
        address_type TEXT NOT NULL,
        observations TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (city_id) REFERENCES cities (id) ON DELETE CASCADE
      )
    `;
        await this.dbConnection.runAsync(sql);
    }

    private async createPhonesTable(): Promise<void> {
        const sql = `
      CREATE TABLE IF NOT EXISTS phones (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        area_code TEXT NOT NULL,
        number TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
        await this.dbConnection.runAsync(sql);
    }

    private async createClientsTable(): Promise<void> {
        const sql = `
      CREATE TABLE IF NOT EXISTS clients (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        cpf TEXT NOT NULL UNIQUE,
        gender TEXT NOT NULL,
        birth_date TEXT NOT NULL,
        phone_id TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        residential_address_id TEXT NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (phone_id) REFERENCES phones (id) ON DELETE CASCADE,
        FOREIGN KEY (residential_address_id) REFERENCES addresses (id) ON DELETE CASCADE
      )
    `;
        await this.dbConnection.runAsync(sql);
    }

    private async createClientBillingAddressesTable(): Promise<void> {
        const sql = `
      CREATE TABLE IF NOT EXISTS client_billing_addresses (
        id TEXT PRIMARY KEY,
        client_id TEXT NOT NULL,
        address_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE,
        FOREIGN KEY (address_id) REFERENCES addresses (id) ON DELETE CASCADE,
        UNIQUE(client_id, address_id)
      )
    `;
        await this.dbConnection.runAsync(sql);
    }

    private async createClientDeliveryAddressesTable(): Promise<void> {
        const sql = `
      CREATE TABLE IF NOT EXISTS client_delivery_addresses (
        id TEXT PRIMARY KEY,
        client_id TEXT NOT NULL,
        address_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE,
        FOREIGN KEY (address_id) REFERENCES addresses (id) ON DELETE CASCADE,
        UNIQUE(client_id, address_id)
      )
    `;
        await this.dbConnection.runAsync(sql);
    }
}