import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { IRepository } from '../interfaces/IRepository';
import { Client } from '../../domain/entities/Client';
import { Address } from '../../domain/entities/Address';
import { City } from '../../domain/entities/City';
import { State } from '../../domain/entities/State';
import { Country } from '../../domain/entities/Country';
import { Phone, PhoneType } from '../../domain/entities/Phone';
import { Gender } from '../../domain/entities/Gender';
import { ResidenceType, StreetType, AddressType } from '../../domain/entities/AddressTypes';
import { ClientFilter } from '../../domain/interfaces/ClientFilter';

export class ClientRepository implements IRepository<Client> {
  private db: sqlite3.Database;
  
  constructor() {
    this.db = new sqlite3.Database('./database.sqlite', (err) => {
      if (err) {
        console.error('Erro ao conectar com o banco de dados:', err);
      } else {
        console.log('Conectado ao banco SQLite');
        this.initDatabase();
      }
    });
  }
  
  private initDatabase(): void {
    this.db.serialize(() => {
      // Enable foreign keys
      this.db.run('PRAGMA foreign_keys = ON');
      
      // Create tables with proper schema
      this.db.run(`
        CREATE TABLE IF NOT EXISTS countries (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      this.db.run(`
        CREATE TABLE IF NOT EXISTS states (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          country_id TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (country_id) REFERENCES countries (id) ON DELETE CASCADE,
          UNIQUE(name, country_id)
        )
      `);
      
      this.db.run(`
        CREATE TABLE IF NOT EXISTS cities (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          state_id TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (state_id) REFERENCES states (id) ON DELETE CASCADE,
          UNIQUE(name, state_id)
        )
      `);
      
      this.db.run(`
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
      `);
      
      this.db.run(`
        CREATE TABLE IF NOT EXISTS phones (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          area_code TEXT NOT NULL,
          number TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      this.db.run(`
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
      `);
      
      this.db.run(`
        CREATE TABLE IF NOT EXISTS client_billing_addresses (
          id TEXT PRIMARY KEY,
          client_id TEXT NOT NULL,
          address_id TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE,
          FOREIGN KEY (address_id) REFERENCES addresses (id) ON DELETE CASCADE,
          UNIQUE(client_id, address_id)
        )
      `);
      
      this.db.run(`
        CREATE TABLE IF NOT EXISTS client_delivery_addresses (
          id TEXT PRIMARY KEY,
          client_id TEXT NOT NULL,
          address_id TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE,
          FOREIGN KEY (address_id) REFERENCES addresses (id) ON DELETE CASCADE,
          UNIQUE(client_id, address_id)
        )
      `);
      
      console.log('Database schema created successfully');
    });
  }
  
  async save(client: Client): Promise<Client> {
    return new Promise((resolve, reject) => {
      this.db.serialize(async () => {
        try {
          this.db.run('BEGIN TRANSACTION');
          
          if (!client.id) {
            client.id = uuidv4();
          }
          
          const residentialAddressId = await this.saveAddress(client.residentialAddress);
          const phoneId = await this.savePhone(client.phone);
          
          await this.runAsync(
            `INSERT INTO clients (
              id, name, cpf, gender, birth_date, phone_id, email, password, 
              residential_address_id, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              client.id,
              client.name,
              client.cpf,
              client.gender,
              client.birthDate.toISOString(),
              phoneId,
              client.email,
              client.password,
              residentialAddressId,
              client.isActive ? 1 : 0
            ]
          );
          
          for (const billingAddress of client.billingAddresses) {
            const addressId = await this.saveAddress(billingAddress);
            await this.runAsync(
              'INSERT INTO client_billing_addresses (id, client_id, address_id) VALUES (?, ?, ?)',
              [uuidv4(), client.id, addressId]
            );
          }
          
          for (const deliveryAddress of client.deliveryAddresses) {
            const addressId = await this.saveAddress(deliveryAddress);
            await this.runAsync(
              'INSERT INTO client_delivery_addresses (id, client_id, address_id) VALUES (?, ?, ?)',
              [uuidv4(), client.id, addressId]
            );
          }
          
          this.db.run('COMMIT');
          
          resolve(client);
        } catch (error) {
          this.db.run('ROLLBACK');
          reject(error);
        }
      });
    });
  }
  
  async update(client: Client): Promise<Client> {
    return new Promise((resolve, reject) => {
      if (!client.id) {
        reject(new Error('ID do cliente é obrigatório para atualização'));
        return;
      }
      
      this.db.serialize(async () => {
        try {
          this.db.run('BEGIN TRANSACTION');
          
          // Update residential address and phone
          await this.updateAddress(client.residentialAddress);
          await this.updatePhone(client.phone, client.id!);
          
          // Update basic client info
          await this.runAsync(
            `UPDATE clients SET 
              name = ?, cpf = ?, gender = ?, birth_date = ?, 
              email = ?, password = ?, is_active = ?
             WHERE id = ?`,
            [
              client.name,
              client.cpf,
              client.gender,
              client.birthDate.toISOString(),
              client.email,
              client.password,
              client.isActive ? 1 : 0,
              client.id
            ]
          );
          
          // Clear existing address associations
          await this.runAsync(
            'DELETE FROM client_billing_addresses WHERE client_id = ?',
            [client.id]
          );
          await this.runAsync(
            'DELETE FROM client_delivery_addresses WHERE client_id = ?',
            [client.id]
          );

          // Add billing addresses
          for (const billingAddress of client.billingAddresses) {
            const addressId = await this.saveAddress(billingAddress);
            await this.runAsync(
              'INSERT INTO client_billing_addresses (id, client_id, address_id) VALUES (?, ?, ?)',
              [uuidv4(), client.id, addressId]
            );
          }
          
          // Add delivery addresses
          for (const deliveryAddress of client.deliveryAddresses) {
            const addressId = await this.saveAddress(deliveryAddress);
            await this.runAsync(
              'INSERT INTO client_delivery_addresses (id, client_id, address_id) VALUES (?, ?, ?)',
              [uuidv4(), client.id, addressId]
            );
          }
          
          this.db.run('COMMIT');
          
          resolve(client);
        } catch (error) {
          this.db.run('ROLLBACK');
          reject(error);
        }
      });
    });
  }
  
  async delete(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.serialize(async () => {
        try {
          this.db.run('BEGIN TRANSACTION');
          await this.runAsync(
            'DELETE FROM client_billing_addresses WHERE client_id = ?',
            [id]
          );
          await this.runAsync(
            'DELETE FROM client_delivery_addresses WHERE client_id = ?',
            [id]
          );
          await this.runAsync('DELETE FROM clients WHERE id = ?', [id]);
          this.db.run('COMMIT');
          
          resolve();
        } catch (error) {
          this.db.run('ROLLBACK');
          reject(error);
        }
      });
    });
  }
  
  async findById(id: string): Promise<Client | null> {
    return new Promise((resolve, reject) => {
      this.db.serialize(async () => {
        try {
          const clientRow = await this.getAsync(`
            SELECT c.*, p.type as phone_type, p.area_code, p.number as phone_number
            FROM clients c
            JOIN phones p ON c.phone_id = p.id
            WHERE c.id = ?
          `, [id]);
          
          if (!clientRow) {
            resolve(null);
            return;
          }
          
          const residentialAddress = await this.findAddressById(clientRow.residential_address_id);
          const billingAddresses = await this.findBillingAddresses(id);
          const deliveryAddresses = await this.findDeliveryAddresses(id);

          const phone = new Phone(
            clientRow.phone_type as PhoneType,
            clientRow.area_code,
            clientRow.phone_number
          );

          const client = new Client(
            clientRow.name,
            clientRow.cpf,
            clientRow.gender as Gender,
            new Date(clientRow.birth_date),
            phone,
            clientRow.email,
            clientRow.password,
            residentialAddress!,
            billingAddresses,
            deliveryAddresses
          );
          
          client.id = clientRow.id;
          client.isActive = Boolean(clientRow.is_active);
          
          resolve(client);
        } catch (error) {
          reject(error);
        }
      });
    });
  }
  
  async findAll(): Promise<Client[]> {
    return new Promise((resolve, reject) => {
      this.db.serialize(async () => {
        try {
          const clientRows = await this.allAsync(`
            SELECT c.*, p.type as phone_type, p.area_code, p.number as phone_number
            FROM clients c
            JOIN phones p ON c.phone_id = p.id
            ORDER BY c.name
          `);
          
          const clients: Client[] = [];
          
          for (const row of clientRows) {
            const client = await this.buildClientFromRow(row);
            clients.push(client);
          }
          
          resolve(clients);
        } catch (error) {
          reject(error);
        }
      });
    });
  }
  
  async findByFilter(filter: ClientFilter): Promise<Client[]> {
    return new Promise((resolve, reject) => {
      this.db.serialize(async () => {
        try {
          let query = `
            SELECT DISTINCT c.*, p.id as phone_id, p.type as phone_type, p.area_code, p.number as phone_number
            FROM clients c
            JOIN phones p ON c.phone_id = p.id
            JOIN addresses ra ON c.residential_address_id = ra.id
            JOIN cities ct ON ra.city_id = ct.id
            JOIN states st ON ct.state_id = st.id
            JOIN countries co ON st.country_id = co.id
            WHERE 1=1
          `;
          
          const params: any[] = [];
          
          // Basic identification filters
          if (filter.name) {
            query += ' AND LOWER(c.name) LIKE LOWER(?)';
            params.push(`%${filter.name}%`);
          }
          
          if (filter.cpf) {
            // Remove formatting for CPF search
            const cleanCpf = filter.cpf.replace(/[^\d]/g, '');
            query += ' AND REPLACE(REPLACE(REPLACE(c.cpf, ".", ""), "-", ""), "/", "") LIKE ?';
            params.push(`%${cleanCpf}%`);
          }
          
          if (filter.email) {
            query += ' AND LOWER(c.email) LIKE LOWER(?)';
            params.push(`%${filter.email}%`);
          }
          
          if (filter.gender) {
            query += ' AND c.gender = ?';
            params.push(filter.gender);
          }
          
          if (filter.isActive !== undefined) {
            query += ' AND c.is_active = ?';
            params.push(filter.isActive ? 1 : 0);
          }
          
          // Phone filters
          if (filter.phoneType) {
            query += ' AND p.type = ?';
            params.push(filter.phoneType);
          }
          
          if (filter.areaCode) {
            query += ' AND p.area_code = ?';
            params.push(filter.areaCode);
          }
          
          if (filter.phoneNumber) {
            query += ' AND p.number LIKE ?';
            params.push(`%${filter.phoneNumber}%`);
          }
          
          // Date filters
          if (filter.birthDateFrom) {
            query += ' AND c.birth_date >= ?';
            params.push(filter.birthDateFrom.toISOString());
          }
          
          if (filter.birthDateTo) {
            query += ' AND c.birth_date <= ?';
            params.push(filter.birthDateTo.toISOString());
          }
          
          if (filter.createdAtFrom) {
            query += ' AND c.created_at >= ?';
            params.push(filter.createdAtFrom.toISOString());
          }
          
          if (filter.createdAtTo) {
            query += ' AND c.created_at <= ?';
            params.push(filter.createdAtTo.toISOString());
          }
          
          // Address filters
          if (filter.street) {
            query += ' AND LOWER(ra.street) LIKE LOWER(?)';
            params.push(`%${filter.street}%`);
          }
          
          if (filter.neighborhood) {
            query += ' AND LOWER(ra.neighborhood) LIKE LOWER(?)';
            params.push(`%${filter.neighborhood}%`);
          }
          
          if (filter.zipCode) {
            // Remove formatting for ZIP code search
            const cleanZip = filter.zipCode.replace(/[^\d]/g, '');
            query += ' AND REPLACE(ra.zip_code, "-", "") LIKE ?';
            params.push(`%${cleanZip}%`);
          }
          
          if (filter.city) {
            query += ' AND LOWER(ct.name) LIKE LOWER(?)';
            params.push(`%${filter.city}%`);
          }
          
          if (filter.state) {
            query += ' AND LOWER(st.name) LIKE LOWER(?)';
            params.push(`%${filter.state}%`);
          }
          
          if (filter.country) {
            query += ' AND LOWER(co.name) LIKE LOWER(?)';
            params.push(`%${filter.country}%`);
          }
          
          // Age filters (calculated from birth date)
          if (filter.ageFrom !== undefined) {
            const maxBirthDate = new Date();
            maxBirthDate.setFullYear(maxBirthDate.getFullYear() - filter.ageFrom);
            query += ' AND c.birth_date <= ?';
            params.push(maxBirthDate.toISOString());
          }
          
          if (filter.ageTo !== undefined) {
            const minBirthDate = new Date();
            minBirthDate.setFullYear(minBirthDate.getFullYear() - filter.ageTo - 1);
            query += ' AND c.birth_date > ?';
            params.push(minBirthDate.toISOString());
          }
          
          query += ' ORDER BY c.name';
          
          const clientRows = await this.allAsync(query, params);
          
          const clients: Client[] = [];
          
          for (const row of clientRows) {
            const client = await this.buildClientFromRow(row);
            clients.push(client);
          }
          
          resolve(clients);
        } catch (error) {
          reject(error);
        }
      });
    });
  }
  
  private async saveAddress(address: Address): Promise<string> {
    if (!address.id) {
      address.id = uuidv4();
    }
    
    const countryId = await this.saveCountry(address.city.state.country);
    const stateId = await this.saveState(address.city.state, countryId);
    const cityId = await this.saveCity(address.city, stateId);
    
    await this.runAsync(
      `INSERT OR REPLACE INTO addresses (
        id, residence_type, street_type, street, number, neighborhood, 
        zip_code, city_id, address_type, observations
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        address.id,
        address.residenceType,
        address.streetType,
        address.street,
        address.number,
        address.neighborhood,
        address.zipCode,
        cityId,
        address.addressType,
        address.observations || null
      ]
    );
    
    return address.id;
  }
  
  private async updateAddress(address: Address): Promise<void> {
    if (!address.id) {
      throw new Error('ID do endereço é obrigatório para atualização');
    }

    const countryId = await this.saveCountry(address.city.state.country);
    const stateId = await this.saveState(address.city.state, countryId);
    const cityId = await this.saveCity(address.city, stateId);
    
    await this.runAsync(
      `UPDATE addresses SET 
        residence_type = ?, street_type = ?, street = ?, number = ?, 
        neighborhood = ?, zip_code = ?, city_id = ?, address_type = ?, observations = ?
       WHERE id = ?`,
      [
        address.residenceType,
        address.streetType,
        address.street,
        address.number,
        address.neighborhood,
        address.zipCode,
        cityId,
        address.addressType,
        address.observations || null,
        address.id
      ]
    );
  }
  
  private async savePhone(phone: Phone): Promise<string> {
    const phoneId = uuidv4();
    
    await this.runAsync(
      'INSERT INTO phones (id, type, area_code, number) VALUES (?, ?, ?, ?)',
      [phoneId, phone.type, phone.areaCode, phone.number]
    );
    
    return phoneId;
  }
  
  private async updatePhone(phone: Phone, clientId: string): Promise<void> {
    const clientRow = await this.getAsync(
      'SELECT phone_id FROM clients WHERE id = ?',
      [clientId]
    );
    
    if (!clientRow || !clientRow.phone_id) {
      throw new Error('Cliente ou telefone não encontrado');
    }
    
    await this.runAsync(
      'UPDATE phones SET type = ?, area_code = ?, number = ? WHERE id = ?',
      [phone.type, phone.areaCode, phone.number, clientRow.phone_id]
    );
  }
  
  private async saveCountry(country: Country): Promise<string> {
    if (!country.id) {
      country.id = uuidv4();
    }
    
    // Check if country already exists by name
    const existingCountry = await this.getAsync(
      'SELECT id FROM countries WHERE name = ?',
      [country.name]
    );
    
    if (existingCountry) {
      return existingCountry.id;
    }
    
    await this.runAsync(
      'INSERT INTO countries (id, name) VALUES (?, ?)',
      [country.id, country.name]
    );
    
    return country.id;
  }
  
  private async saveState(state: State, countryId: string): Promise<string> {
    if (!state.id) {
      state.id = uuidv4();
    }
    
    // Check if state already exists by name and country
    const existingState = await this.getAsync(
      'SELECT id FROM states WHERE name = ? AND country_id = ?',
      [state.name, countryId]
    );
    
    if (existingState) {
      return existingState.id;
    }
    
    await this.runAsync(
      'INSERT INTO states (id, name, country_id) VALUES (?, ?, ?)',
      [state.id, state.name, countryId]
    );
    
    return state.id;
  }
  
  private async saveCity(city: City, stateId: string): Promise<string> {
    if (!city.id) {
      city.id = uuidv4();
    }
    
    // Check if city already exists by name and state
    const existingCity = await this.getAsync(
      'SELECT id FROM cities WHERE name = ? AND state_id = ?',
      [city.name, stateId]
    );
    
    if (existingCity) {
      return existingCity.id;
    }
    
    await this.runAsync(
      'INSERT INTO cities (id, name, state_id) VALUES (?, ?, ?)',
      [city.id, city.name, stateId]
    );
    
    return city.id;
  }
  
  private async findAddressById(addressId: string): Promise<Address | null> {
    const addressRow = await this.getAsync(`
      SELECT a.*, c.name as city_name, s.name as state_name, co.name as country_name
      FROM addresses a
      JOIN cities c ON a.city_id = c.id
      JOIN states s ON c.state_id = s.id
      JOIN countries co ON s.country_id = co.id
      WHERE a.id = ?
    `, [addressId]);
    
    if (!addressRow) return null;
    
    const country = new Country(addressRow.country_name);
    const state = new State(addressRow.state_name, country);
    const city = new City(addressRow.city_name, state);
    
    const address = new Address(
      addressRow.residence_type as ResidenceType,
      addressRow.street_type as StreetType,
      addressRow.street,
      addressRow.number,
      addressRow.neighborhood,
      addressRow.zip_code,
      city,
      addressRow.address_type as AddressType,
      addressRow.observations
    );
    
    address.id = addressRow.id;
    return address;
  }
  
  private async findBillingAddresses(clientId: string): Promise<Address[]> {
    const addressRows = await this.allAsync(`
      SELECT a.*, c.name as city_name, s.name as state_name, co.name as country_name
      FROM client_billing_addresses cba
      JOIN addresses a ON cba.address_id = a.id
      JOIN cities c ON a.city_id = c.id
      JOIN states s ON c.state_id = s.id
      JOIN countries co ON s.country_id = co.id
      WHERE cba.client_id = ?
    `, [clientId]);
    
    return this.buildAddressesFromRows(addressRows);
  }
  
  private async findDeliveryAddresses(clientId: string): Promise<Address[]> {
    const addressRows = await this.allAsync(`
      SELECT a.*, c.name as city_name, s.name as state_name, co.name as country_name
      FROM client_delivery_addresses cda
      JOIN addresses a ON cda.address_id = a.id
      JOIN cities c ON a.city_id = c.id
      JOIN states s ON c.state_id = s.id
      JOIN countries co ON s.country_id = co.id
      WHERE cda.client_id = ?
    `, [clientId]);
    
    return this.buildAddressesFromRows(addressRows);
  }
  
  private buildAddressesFromRows(rows: any[]): Address[] {
    return rows.map(row => {
      const country = new Country(row.country_name);
      const state = new State(row.state_name, country);
      const city = new City(row.city_name, state);
      
      const address = new Address(
        row.residence_type as ResidenceType,
        row.street_type as StreetType,
        row.street,
        row.number,
        row.neighborhood,
        row.zip_code,
        city,
        row.address_type as AddressType,
        row.observations
      );
      
      address.id = row.id;
      return address;
    });
  }
  
  private async buildClientFromRow(row: any): Promise<Client> {
    const residentialAddress = await this.findAddressById(row.residential_address_id);
    const billingAddresses = await this.findBillingAddresses(row.id);
    const deliveryAddresses = await this.findDeliveryAddresses(row.id);
    
    const phone = new Phone(
      row.phone_type as PhoneType,
      row.area_code,
      row.phone_number
    );
    
    const client = new Client(
      row.name,
      row.cpf,
      row.gender as Gender,
      new Date(row.birth_date),
      phone,
      row.email,
      row.password,
      residentialAddress!,
      billingAddresses,
      deliveryAddresses
    );
    
    client.id = row.id;
    client.isActive = Boolean(row.is_active);
    
    return client;
  }
  
  private runAsync(sql: string, params: any[] = []): Promise<void> {
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
  
  private getAsync(sql: string, params: any[] = []): Promise<any> {
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
  
  private allAsync(sql: string, params: any[] = []): Promise<any[]> {
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
