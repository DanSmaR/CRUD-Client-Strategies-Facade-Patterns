import { IStrategy } from '../interfaces/IStrategy';
import { Client } from '../../domain/entities/Client';
import { IDomainEntity } from '../../domain/interfaces/IDomainEntity';

export class EmailValidationStrategy implements IStrategy<IDomainEntity> {
  async process(entity: IDomainEntity): Promise<string | null> {
    if (!(entity instanceof Client)) {
      return null;
    }

    const client = entity as Client;
    
    if (!client.email) {
      return 'E-mail é obrigatório';
    }

    // Regex básico para validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(client.email)) {
      return 'E-mail deve ter um formato válido';
    }

    return null;
  }
}
