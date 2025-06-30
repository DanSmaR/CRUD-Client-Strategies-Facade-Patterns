import { IStrategy } from '../interfaces/IStrategy';
import { Client } from '../../domain/entities/Client';
import {DomainEntity} from "../../domain/entities/DomainEntity";

export class EmailValidationStrategy implements IStrategy<DomainEntity
> {
  async process(entity: DomainEntity
): Promise<string | null> {
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
