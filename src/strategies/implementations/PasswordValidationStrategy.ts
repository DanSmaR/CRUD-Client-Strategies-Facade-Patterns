import { IStrategy } from '../interfaces/IStrategy';
import { Client } from '../../domain/entities/Client';
import {DomainEntity} from "../../domain/entities/DomainEntity";

export class PasswordValidationStrategy implements IStrategy<DomainEntity
> {
  async process(entity: DomainEntity
): Promise<string | null> {
    if (!(entity instanceof Client)) {
      return null;
    }

    const client = entity as Client;
    
    if (!client.password) {
      return 'Senha é obrigatória';
    }

    if (client.password.length < 8) {
      return 'Senha deve ter pelo menos 8 caracteres';
    }

    if (client.password.length > 50) {
      return 'Senha não pode ter mais de 50 caracteres';
    }

    // Verifica se tem pelo menos uma letra maiúscula
    if (!/[A-Z]/.test(client.password)) {
      return 'Senha deve conter pelo menos uma letra maiúscula';
    }

    // Verifica se tem pelo menos um número
    if (!/\d/.test(client.password)) {
      return 'Senha deve conter pelo menos um número';
    }

    // Verifica se tem pelo menos um caractere especial
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(client.password)) {
      return 'Senha deve conter pelo menos um caractere especial';
    }

    return null;
  }
}
