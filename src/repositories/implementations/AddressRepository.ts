import { v4 as uuidv4 } from 'uuid';
import { IRepository } from '../interfaces/IRepository';
import { Address } from '../../domain/entities/Address';
import { City } from '../../domain/entities/City';
import { State } from '../../domain/entities/State';
import { Country } from '../../domain/entities/Country';
import { ResidenceType, StreetType, AddressType } from '../../domain/entities/AddressTypes';
import { AbstractRepository } from "./AbstractRepository";

export class AddressRepository extends AbstractRepository implements IRepository<Address> {

    constructor() {
        super();
    }

    async save(address: Address): Promise<Address> {
        if (!address.id) {
            address.id = uuidv4();
        }

        const countryId = await this.saveCountry(address.city.state.country);
        const stateId = await this.saveState(address.city.state, countryId);
        const cityId = await this.saveCity(address.city, stateId);

        await this.dbConnection.runAsync(
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

        return address;
    }

    async update(address: Address): Promise<Address> {
        if (!address.id) {
            throw new Error('ID do endereço é obrigatório para atualização');
        }

        const countryId = await this.saveCountry(address.city.state.country);
        const stateId = await this.saveState(address.city.state, countryId);
        const cityId = await this.saveCity(address.city, stateId);

        await this.dbConnection.runAsync(
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

        return address;
    }

    async delete(id: string): Promise<void> {
        await this.dbConnection.runAsync('DELETE FROM addresses WHERE id = ?', [id]);
    }

    async findById(id: string): Promise<Address | null> {
        const addressRow = await this.dbConnection.getAsync(`
            SELECT a.*, c.name as city_name, s.name as state_name, co.name as country_name
            FROM addresses a
                     JOIN cities c ON a.city_id = c.id
                     JOIN states s ON c.state_id = s.id
                     JOIN countries co ON s.country_id = co.id
            WHERE a.id = ?
        `, [id]);

        if (!addressRow) return null;

        return this.buildAddressFromRow(addressRow);
    }

    async findAll(): Promise<Address[]> {
        const addressRows = await this.dbConnection.allAsync(`
            SELECT a.*, c.name as city_name, s.name as state_name, co.name as country_name
            FROM addresses a
                     JOIN cities c ON a.city_id = c.id
                     JOIN states s ON c.state_id = s.id
                     JOIN countries co ON s.country_id = co.id
            ORDER BY a.street
        `);

        return this.buildAddressesFromRows(addressRows);
    }

    async findBillingAddresses(clientId: string): Promise<Address[]> {
        const addressRows = await this.dbConnection.allAsync(`
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

    async findDeliveryAddresses(clientId: string): Promise<Address[]> {
        const addressRows = await this.dbConnection.allAsync(`
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

    private async saveCountry(country: Country): Promise<string> {
        if (!country.id) {
            country.id = uuidv4();
        }

        const existingCountry = await this.dbConnection.getAsync(
            'SELECT id FROM countries WHERE name = ?',
            [country.name]
        );

        if (existingCountry) {
            return existingCountry.id;
        }

        await this.dbConnection.runAsync(
            'INSERT INTO countries (id, name) VALUES (?, ?)',
            [country.id, country.name]
        );

        return country.id;
    }

    private async saveState(state: State, countryId: string): Promise<string> {
        if (!state.id) {
            state.id = uuidv4();
        }

        const existingState = await this.dbConnection.getAsync(
            'SELECT id FROM states WHERE name = ? AND country_id = ?',
            [state.name, countryId]
        );

        if (existingState) {
            return existingState.id;
        }

        await this.dbConnection.runAsync(
            'INSERT INTO states (id, name, country_id) VALUES (?, ?, ?)',
            [state.id, state.name, countryId]
        );

        return state.id;
    }

    private async saveCity(city: City, stateId: string): Promise<string> {
        if (!city.id) {
            city.id = uuidv4();
        }

        const existingCity = await this.dbConnection.getAsync(
            'SELECT id FROM cities WHERE name = ? AND state_id = ?',
            [city.name, stateId]
        );

        if (existingCity) {
            return existingCity.id;
        }

        await this.dbConnection.runAsync(
            'INSERT INTO cities (id, name, state_id) VALUES (?, ?, ?)',
            [city.id, city.name, stateId]
        );

        return city.id;
    }

    private buildAddressFromRow(row: any): Address {
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
    }

    private buildAddressesFromRows(rows: any[]): Address[] {
        return rows.map(row => this.buildAddressFromRow(row));
    }
}