"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientRepository = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const uuid_1 = require("uuid");
const Client_1 = require("../../domain/entities/Client");
const Address_1 = require("../../domain/entities/Address");
const City_1 = require("../../domain/entities/City");
const State_1 = require("../../domain/entities/State");
const Country_1 = require("../../domain/entities/Country");
const Phone_1 = require("../../domain/entities/Phone");
class ClientRepository {
    constructor() {
        this.db = new sqlite3_1.default.Database('./database.sqlite', (err) => {
            if (err) {
                console.error('Erro ao conectar com o banco de dados:', err);
            }
            else {
                console.log('Conectado ao banco SQLite');
                this.initDatabase();
            }
        });
    }
    initDatabase() {
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
    save(client) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.db.serialize(() => __awaiter(this, void 0, void 0, function* () {
                    try {
                        this.db.run('BEGIN TRANSACTION');
                        if (!client.id) {
                            client.id = (0, uuid_1.v4)();
                        }
                        const residentialAddressId = yield this.saveAddress(client.residentialAddress);
                        const phoneId = yield this.savePhone(client.phone);
                        yield this.runAsync(`INSERT INTO clients (
              id, name, cpf, gender, birth_date, phone_id, email, password, 
              residential_address_id, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
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
                        ]);
                        for (const billingAddress of client.billingAddresses) {
                            const addressId = yield this.saveAddress(billingAddress);
                            yield this.runAsync('INSERT INTO client_billing_addresses (id, client_id, address_id) VALUES (?, ?, ?)', [(0, uuid_1.v4)(), client.id, addressId]);
                        }
                        for (const deliveryAddress of client.deliveryAddresses) {
                            const addressId = yield this.saveAddress(deliveryAddress);
                            yield this.runAsync('INSERT INTO client_delivery_addresses (id, client_id, address_id) VALUES (?, ?, ?)', [(0, uuid_1.v4)(), client.id, addressId]);
                        }
                        this.db.run('COMMIT');
                        resolve(client);
                    }
                    catch (error) {
                        this.db.run('ROLLBACK');
                        reject(error);
                    }
                }));
            });
        });
    }
    update(client) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (!client.id) {
                    reject(new Error('ID do cliente é obrigatório para atualização'));
                    return;
                }
                this.db.serialize(() => __awaiter(this, void 0, void 0, function* () {
                    try {
                        this.db.run('BEGIN TRANSACTION');
                        // Update residential address and phone
                        yield this.updateAddress(client.residentialAddress);
                        yield this.updatePhone(client.phone, client.id);
                        // Update basic client info
                        yield this.runAsync(`UPDATE clients SET 
              name = ?, cpf = ?, gender = ?, birth_date = ?, 
              email = ?, password = ?, is_active = ?
             WHERE id = ?`, [
                            client.name,
                            client.cpf,
                            client.gender,
                            client.birthDate.toISOString(),
                            client.email,
                            client.password,
                            client.isActive ? 1 : 0,
                            client.id
                        ]);
                        // Clear existing address associations
                        yield this.runAsync('DELETE FROM client_billing_addresses WHERE client_id = ?', [client.id]);
                        yield this.runAsync('DELETE FROM client_delivery_addresses WHERE client_id = ?', [client.id]);
                        // Add billing addresses
                        for (const billingAddress of client.billingAddresses) {
                            const addressId = yield this.saveAddress(billingAddress);
                            yield this.runAsync('INSERT INTO client_billing_addresses (id, client_id, address_id) VALUES (?, ?, ?)', [(0, uuid_1.v4)(), client.id, addressId]);
                        }
                        // Add delivery addresses
                        for (const deliveryAddress of client.deliveryAddresses) {
                            const addressId = yield this.saveAddress(deliveryAddress);
                            yield this.runAsync('INSERT INTO client_delivery_addresses (id, client_id, address_id) VALUES (?, ?, ?)', [(0, uuid_1.v4)(), client.id, addressId]);
                        }
                        this.db.run('COMMIT');
                        resolve(client);
                    }
                    catch (error) {
                        this.db.run('ROLLBACK');
                        reject(error);
                    }
                }));
            });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.db.serialize(() => __awaiter(this, void 0, void 0, function* () {
                    try {
                        this.db.run('BEGIN TRANSACTION');
                        yield this.runAsync('DELETE FROM client_billing_addresses WHERE client_id = ?', [id]);
                        yield this.runAsync('DELETE FROM client_delivery_addresses WHERE client_id = ?', [id]);
                        yield this.runAsync('DELETE FROM clients WHERE id = ?', [id]);
                        this.db.run('COMMIT');
                        resolve();
                    }
                    catch (error) {
                        this.db.run('ROLLBACK');
                        reject(error);
                    }
                }));
            });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.db.serialize(() => __awaiter(this, void 0, void 0, function* () {
                    try {
                        const clientRow = yield this.getAsync(`
            SELECT c.*, p.type as phone_type, p.area_code, p.number as phone_number
            FROM clients c
            JOIN phones p ON c.phone_id = p.id
            WHERE c.id = ?
          `, [id]);
                        if (!clientRow) {
                            resolve(null);
                            return;
                        }
                        const residentialAddress = yield this.findAddressById(clientRow.residential_address_id);
                        const billingAddresses = yield this.findBillingAddresses(id);
                        const deliveryAddresses = yield this.findDeliveryAddresses(id);
                        const phone = new Phone_1.Phone(clientRow.phone_type, clientRow.area_code, clientRow.phone_number);
                        const client = new Client_1.Client(clientRow.name, clientRow.cpf, clientRow.gender, new Date(clientRow.birth_date), phone, clientRow.email, clientRow.password, residentialAddress, billingAddresses, deliveryAddresses);
                        client.id = clientRow.id;
                        client.isActive = Boolean(clientRow.is_active);
                        resolve(client);
                    }
                    catch (error) {
                        reject(error);
                    }
                }));
            });
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.db.serialize(() => __awaiter(this, void 0, void 0, function* () {
                    try {
                        const clientRows = yield this.allAsync(`
            SELECT c.*, p.type as phone_type, p.area_code, p.number as phone_number
            FROM clients c
            JOIN phones p ON c.phone_id = p.id
            ORDER BY c.name
          `);
                        const clients = [];
                        for (const row of clientRows) {
                            const client = yield this.buildClientFromRow(row);
                            clients.push(client);
                        }
                        resolve(clients);
                    }
                    catch (error) {
                        reject(error);
                    }
                }));
            });
        });
    }
    findByFilter(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.db.serialize(() => __awaiter(this, void 0, void 0, function* () {
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
                        const params = [];
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
                        const clientRows = yield this.allAsync(query, params);
                        const clients = [];
                        for (const row of clientRows) {
                            const client = yield this.buildClientFromRow(row);
                            clients.push(client);
                        }
                        resolve(clients);
                    }
                    catch (error) {
                        reject(error);
                    }
                }));
            });
        });
    }
    saveAddress(address) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!address.id) {
                address.id = (0, uuid_1.v4)();
            }
            const countryId = yield this.saveCountry(address.city.state.country);
            const stateId = yield this.saveState(address.city.state, countryId);
            const cityId = yield this.saveCity(address.city, stateId);
            yield this.runAsync(`INSERT OR REPLACE INTO addresses (
        id, residence_type, street_type, street, number, neighborhood, 
        zip_code, city_id, address_type, observations
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
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
            ]);
            return address.id;
        });
    }
    updateAddress(address) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!address.id) {
                throw new Error('ID do endereço é obrigatório para atualização');
            }
            const countryId = yield this.saveCountry(address.city.state.country);
            const stateId = yield this.saveState(address.city.state, countryId);
            const cityId = yield this.saveCity(address.city, stateId);
            yield this.runAsync(`UPDATE addresses SET 
        residence_type = ?, street_type = ?, street = ?, number = ?, 
        neighborhood = ?, zip_code = ?, city_id = ?, address_type = ?, observations = ?
       WHERE id = ?`, [
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
            ]);
        });
    }
    savePhone(phone) {
        return __awaiter(this, void 0, void 0, function* () {
            const phoneId = (0, uuid_1.v4)();
            yield this.runAsync('INSERT INTO phones (id, type, area_code, number) VALUES (?, ?, ?, ?)', [phoneId, phone.type, phone.areaCode, phone.number]);
            return phoneId;
        });
    }
    updatePhone(phone, clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const clientRow = yield this.getAsync('SELECT phone_id FROM clients WHERE id = ?', [clientId]);
            if (!clientRow || !clientRow.phone_id) {
                throw new Error('Cliente ou telefone não encontrado');
            }
            yield this.runAsync('UPDATE phones SET type = ?, area_code = ?, number = ? WHERE id = ?', [phone.type, phone.areaCode, phone.number, clientRow.phone_id]);
        });
    }
    saveCountry(country) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!country.id) {
                country.id = (0, uuid_1.v4)();
            }
            // Check if country already exists by name
            const existingCountry = yield this.getAsync('SELECT id FROM countries WHERE name = ?', [country.name]);
            if (existingCountry) {
                return existingCountry.id;
            }
            yield this.runAsync('INSERT INTO countries (id, name) VALUES (?, ?)', [country.id, country.name]);
            return country.id;
        });
    }
    saveState(state, countryId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!state.id) {
                state.id = (0, uuid_1.v4)();
            }
            // Check if state already exists by name and country
            const existingState = yield this.getAsync('SELECT id FROM states WHERE name = ? AND country_id = ?', [state.name, countryId]);
            if (existingState) {
                return existingState.id;
            }
            yield this.runAsync('INSERT INTO states (id, name, country_id) VALUES (?, ?, ?)', [state.id, state.name, countryId]);
            return state.id;
        });
    }
    saveCity(city, stateId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!city.id) {
                city.id = (0, uuid_1.v4)();
            }
            // Check if city already exists by name and state
            const existingCity = yield this.getAsync('SELECT id FROM cities WHERE name = ? AND state_id = ?', [city.name, stateId]);
            if (existingCity) {
                return existingCity.id;
            }
            yield this.runAsync('INSERT INTO cities (id, name, state_id) VALUES (?, ?, ?)', [city.id, city.name, stateId]);
            return city.id;
        });
    }
    findAddressById(addressId) {
        return __awaiter(this, void 0, void 0, function* () {
            const addressRow = yield this.getAsync(`
      SELECT a.*, c.name as city_name, s.name as state_name, co.name as country_name
      FROM addresses a
      JOIN cities c ON a.city_id = c.id
      JOIN states s ON c.state_id = s.id
      JOIN countries co ON s.country_id = co.id
      WHERE a.id = ?
    `, [addressId]);
            if (!addressRow)
                return null;
            const country = new Country_1.Country(addressRow.country_name);
            const state = new State_1.State(addressRow.state_name, country);
            const city = new City_1.City(addressRow.city_name, state);
            const address = new Address_1.Address(addressRow.residence_type, addressRow.street_type, addressRow.street, addressRow.number, addressRow.neighborhood, addressRow.zip_code, city, addressRow.address_type, addressRow.observations);
            address.id = addressRow.id;
            return address;
        });
    }
    findBillingAddresses(clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const addressRows = yield this.allAsync(`
      SELECT a.*, c.name as city_name, s.name as state_name, co.name as country_name
      FROM client_billing_addresses cba
      JOIN addresses a ON cba.address_id = a.id
      JOIN cities c ON a.city_id = c.id
      JOIN states s ON c.state_id = s.id
      JOIN countries co ON s.country_id = co.id
      WHERE cba.client_id = ?
    `, [clientId]);
            return this.buildAddressesFromRows(addressRows);
        });
    }
    findDeliveryAddresses(clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const addressRows = yield this.allAsync(`
      SELECT a.*, c.name as city_name, s.name as state_name, co.name as country_name
      FROM client_delivery_addresses cda
      JOIN addresses a ON cda.address_id = a.id
      JOIN cities c ON a.city_id = c.id
      JOIN states s ON c.state_id = s.id
      JOIN countries co ON s.country_id = co.id
      WHERE cda.client_id = ?
    `, [clientId]);
            return this.buildAddressesFromRows(addressRows);
        });
    }
    buildAddressesFromRows(rows) {
        return rows.map(row => {
            const country = new Country_1.Country(row.country_name);
            const state = new State_1.State(row.state_name, country);
            const city = new City_1.City(row.city_name, state);
            const address = new Address_1.Address(row.residence_type, row.street_type, row.street, row.number, row.neighborhood, row.zip_code, city, row.address_type, row.observations);
            address.id = row.id;
            return address;
        });
    }
    buildClientFromRow(row) {
        return __awaiter(this, void 0, void 0, function* () {
            const residentialAddress = yield this.findAddressById(row.residential_address_id);
            const billingAddresses = yield this.findBillingAddresses(row.id);
            const deliveryAddresses = yield this.findDeliveryAddresses(row.id);
            const phone = new Phone_1.Phone(row.phone_type, row.area_code, row.phone_number);
            const client = new Client_1.Client(row.name, row.cpf, row.gender, new Date(row.birth_date), phone, row.email, row.password, residentialAddress, billingAddresses, deliveryAddresses);
            client.id = row.id;
            client.isActive = Boolean(row.is_active);
            return client;
        });
    }
    runAsync(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    getAsync(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(row);
                }
            });
        });
    }
    allAsync(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows || []);
                }
            });
        });
    }
}
exports.ClientRepository = ClientRepository;
