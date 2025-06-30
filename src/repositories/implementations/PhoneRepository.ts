import { v4 as uuidv4 } from 'uuid';
import { IRepository } from '../interfaces/IRepository';
import { Phone, PhoneType } from '../../domain/entities/Phone';
import { AbstractRepository } from './AbstractRepository';

export class PhoneRepository extends AbstractRepository implements IRepository<Phone> {

    constructor() {
        super();
    }

    async save(phone: Phone): Promise<Phone> {
        const phoneId = uuidv4();

        await this.dbConnection.runAsync(
            'INSERT INTO phones (id, type, area_code, number) VALUES (?, ?, ?, ?)',
            [phoneId, phone.type, phone.areaCode, phone.number]
        );

        return phone;
    }

    async update(phone: Phone): Promise<Phone> {
        throw new Error('Método não implementado para Phone');
    }

    async delete(id: string): Promise<void> {
        await this.dbConnection.runAsync('DELETE FROM phones WHERE id = ?', [id]);
    }

    async findById(id: string): Promise<Phone | null> {
        const phoneRow = await this.dbConnection.getAsync(
            'SELECT * FROM phones WHERE id = ?',
            [id]
        );

        if (!phoneRow) return null;

        return new Phone(
            phoneRow.type as PhoneType,
            phoneRow.area_code,
            phoneRow.number
        );
    }

    async findAll(): Promise<Phone[]> {
        const phoneRows = await this.dbConnection.allAsync('SELECT * FROM phones ORDER BY type, area_code, number');

        return phoneRows.map(row => new Phone(
            row.type as PhoneType,
            row.area_code,
            row.number
        ));
    }

    async saveAndGetId(phone: Phone): Promise<string> {
        const phoneId = uuidv4();

        await this.dbConnection.runAsync(
            'INSERT INTO phones (id, type, area_code, number) VALUES (?, ?, ?, ?)',
            [phoneId, phone.type, phone.areaCode, phone.number]
        );

        return phoneId;
    }

    async updateByClientId(phone: Phone, clientId: string): Promise<void> {
        const clientRow = await this.dbConnection.getAsync(
            'SELECT phone_id FROM clients WHERE id = ?',
            [clientId]
        );

        if (!clientRow || !clientRow.phone_id) {
            throw new Error('Cliente ou telefone não encontrado');
        }

        await this.dbConnection.runAsync(
            'UPDATE phones SET type = ?, area_code = ?, number = ? WHERE id = ?',
            [phone.type, phone.areaCode, phone.number, clientRow.phone_id]
        );
    }
}