import { IStrategy } from '../interfaces/IStrategy';
import { Client } from '../../domain/entities/Client';
import { IDomainEntity } from '../../domain/interfaces/IDomainEntity';

export class PhoneValidationStrategy implements IStrategy<IDomainEntity> {
  async process(entity: IDomainEntity): Promise<string | null> {
    if (!(entity instanceof Client)) {
      return null;
    }

    const client = entity as Client;
    
    if (!client.phone) {
      return 'Telefone é obrigatório';
    }

    if (!client.phone.areaCode || client.phone.areaCode.length !== 2) {
      return 'DDD deve ter 2 dígitos';
    }

    if (!client.phone.number || client.phone.number.length < 8 || client.phone.number.length > 9) {
      return 'Número de telefone deve ter entre 8 e 9 dígitos';
    }

    // Verifica se são apenas números
    if (!/^\d+$/.test(client.phone.areaCode) || !/^\d+$/.test(client.phone.number)) {
      return 'Telefone deve conter apenas números';
    }

    return null;
  }
}
