import { v4 as uuidv4 } from 'uuid';
import { Client } from '../../domain/entities/Client';
import { Phone, PhoneType } from '../../domain/entities/Phone';
import { Gender } from '../../domain/entities/Gender';
import { ClientFilter } from '../../domain/interfaces/ClientFilter';
import { AddressRepository } from './AddressRepository';
import { PhoneRepository } from './PhoneRepository';
import { AbstractRepository } from "./AbstractRepository";
import { IRepository } from "../interfaces/IRepository";

export class ClientRepository extends AbstractRepository implements IRepository<Client> {
  private addressRepository: AddressRepository;
  private phoneRepository: PhoneRepository;

  constructor() {
    super();
    this.addressRepository = new AddressRepository();
    this.phoneRepository = new PhoneRepository();
  }

  async save(client: Client): Promise<Client> {
    const db = this.dbConnection.getDatabase();

    try {
      await this.runTransaction(async () => {
        if (!client.id) {
          client.id = uuidv4();
        }

        const residentialAddressId = (await this.addressRepository.save(client.residentialAddress)).id!;
        const phoneId = await this.phoneRepository.saveAndGetId(client.phone);

        await this.dbConnection.runAsync(
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
          const addressId = (await this.addressRepository.save(billingAddress)).id!;
          await this.dbConnection.runAsync(
              'INSERT INTO client_billing_addresses (id, client_id, address_id) VALUES (?, ?, ?)',
              [uuidv4(), client.id, addressId]
          );
        }

        for (const deliveryAddress of client.deliveryAddresses) {
          const addressId = (await this.addressRepository.save(deliveryAddress)).id!;
          await this.dbConnection.runAsync(
              'INSERT INTO client_delivery_addresses (id, client_id, address_id) VALUES (?, ?, ?)',
              [uuidv4(), client.id, addressId]
          );
        }
      });

      return client;
    } catch (error) {
      throw error;
    }
  }

  async update(client: Client): Promise<Client> {
    if (!client.id) {
      throw new Error('ID do cliente é obrigatório para atualização');
    }

    try {
      await this.runTransaction(async () => {
        await this.addressRepository.update(client.residentialAddress);
        await this.phoneRepository.updateByClientId(client.phone, client.id!);

        await this.dbConnection.runAsync(
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

        await this.dbConnection.runAsync(
            'DELETE FROM client_billing_addresses WHERE client_id = ?',
            [client.id]
        );
        await this.dbConnection.runAsync(
            'DELETE FROM client_delivery_addresses WHERE client_id = ?',
            [client.id]
        );

        for (const billingAddress of client.billingAddresses) {
          const addressId = (await this.addressRepository.save(billingAddress)).id!;
          await this.dbConnection.runAsync(
              'INSERT INTO client_billing_addresses (id, client_id, address_id) VALUES (?, ?, ?)',
              [uuidv4(), client.id, addressId]
          );
        }

        for (const deliveryAddress of client.deliveryAddresses) {
          const addressId = (await this.addressRepository.save(deliveryAddress)).id!;
          await this.dbConnection.runAsync(
              'INSERT INTO client_delivery_addresses (id, client_id, address_id) VALUES (?, ?, ?)',
              [uuidv4(), client.id, addressId]
          );
        }
      });

      return client;
    } catch (error) {
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.runTransaction(async () => {
        await this.dbConnection.runAsync(
            'DELETE FROM client_billing_addresses WHERE client_id = ?',
            [id]
        );
        await this.dbConnection.runAsync(
            'DELETE FROM client_delivery_addresses WHERE client_id = ?',
            [id]
        );
        await this.dbConnection.runAsync('DELETE FROM clients WHERE id = ?', [id]);
      });
    } catch (error) {
      throw error;
    }
  }

  async findById(id: string): Promise<Client | null> {
    const clientRow = await this.dbConnection.getAsync(`
      SELECT c.*, p.type as phone_type, p.area_code, p.number as phone_number
      FROM clients c
      JOIN phones p ON c.phone_id = p.id
      WHERE c.id = ?
    `, [id]);

    if (!clientRow) {
      return null;
    }

    return await this.buildClientFromRow(clientRow);
  }

  async findAll(): Promise<Client[]> {
    const clientRows = await this.dbConnection.allAsync(`
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

    return clients;
  }

  async findByFilter(filter: ClientFilter): Promise<Client[]> {
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

    if (filter.name) {
      query += ' AND LOWER(c.name) LIKE LOWER(?)';
      params.push(`%${filter.name}%`);
    }

    if (filter.cpf) {
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

    query += ' ORDER BY c.name';

    const clientRows = await this.dbConnection.allAsync(query, params);

    const clients: Client[] = [];
    for (const row of clientRows) {
      const client = await this.buildClientFromRow(row);
      clients.push(client);
    }

    return clients;
  }

  private async buildClientFromRow(row: any): Promise<Client> {
    const residentialAddress = await this.addressRepository.findById(row.residential_address_id);
    const billingAddresses = await this.addressRepository.findBillingAddresses(row.id);
    const deliveryAddresses = await this.addressRepository.findDeliveryAddresses(row.id);

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

  private async runTransaction(operation: () => Promise<void>): Promise<void> {
    const db = this.dbConnection.getDatabase();

    return new Promise((resolve, reject) => {
      db.serialize(async () => {
        try {
          db.run('BEGIN TRANSACTION');
          await operation();
          db.run('COMMIT');
          resolve();
        } catch (error) {
          db.run('ROLLBACK');
          reject(error);
        }
      });
    });
  }
}