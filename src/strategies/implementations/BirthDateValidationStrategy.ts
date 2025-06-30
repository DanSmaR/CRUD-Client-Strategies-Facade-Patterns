import { IStrategy } from '../interfaces/IStrategy';
import { Client } from '../../domain/entities/Client';
import {DomainEntity} from "../../domain/entities/DomainEntity";

export class BirthDateValidationStrategy implements IStrategy<DomainEntity
> {
  async process(entity: DomainEntity
): Promise<string | null> {
    if (!(entity instanceof Client)) {
      return null;
    }

    const client = entity as Client;
    
    if (!client.birthDate) {
      return 'Data de nascimento é obrigatória';
    }

    const birthDate = new Date(client.birthDate);
    const today = new Date();
    
    if (birthDate > today) {
      return 'Data de nascimento não pode ser futura';
    }

    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 16);
    
    if (birthDate > minDate) {
      return 'Cliente deve ter pelo menos 16 anos';
    }

    const maxDate = new Date();
    maxDate.setFullYear(today.getFullYear() - 120);
    
    if (birthDate < maxDate) {
      return 'Data de nascimento inválida';
    }

    return null;
  }
}
