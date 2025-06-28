import { Client } from '../../domain/entities/Client';
import { IStrategy } from '../interfaces/IStrategy';

export class CpfValidationStrategy implements IStrategy<Client> {
  async process(client: Client): Promise<string | null> {
    if (!client.cpf) {
      return "CPF é obrigatório";
    }
    
    const cpf = client.cpf.replace(/[^\d]/g, '');
    
    if (cpf.length !== 11) {
      return "CPF deve conter 11 dígitos";
    }
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cpf)) {
      return "CPF inválido";
    }
    
    // Validação do primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    
    let resto = soma % 11;
    let digitoVerificador1 = resto < 2 ? 0 : 11 - resto;
    
    if (parseInt(cpf.charAt(9)) !== digitoVerificador1) {
      return "CPF inválido";
    }
    
    // Validação do segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    
    resto = soma % 11;
    let digitoVerificador2 = resto < 2 ? 0 : 11 - resto;
    
    if (parseInt(cpf.charAt(10)) !== digitoVerificador2) {
      return "CPF inválido";
    }
    
    return null;
  }
}
