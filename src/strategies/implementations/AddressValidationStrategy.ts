import { IStrategy } from '../interfaces/IStrategy';
import { Client } from '../../domain/entities/Client';
import {DomainEntity} from "../../domain/entities/DomainEntity";

export class AddressValidationStrategy implements IStrategy<DomainEntity> {
  async process(entity: DomainEntity): Promise<string | null> {
    if (!(entity instanceof Client)) {
      return null;
    }

    const client = entity as Client;
    
    if (!client.residentialAddress) {
      return 'Endereço residencial é obrigatório';
    }

    const residentialValidation = this.validateAddress(client.residentialAddress, 'residencial');
    if (residentialValidation) {
      return residentialValidation;
    }

    if (!client.billingAddresses || client.billingAddresses.length === 0) {
      return 'Pelo menos um endereço de cobrança é obrigatório';
    }

    if (!client.deliveryAddresses || client.deliveryAddresses.length === 0) {
      return 'Pelo menos um endereço de entrega é obrigatório';
    }

    for (let i = 0; i < client.billingAddresses.length; i++) {
      const validation = this.validateAddress(client.billingAddresses[i], `cobrança ${i + 1}`);
      if (validation) {
        return validation;
      }
    }

    for (let i = 0; i < client.deliveryAddresses.length; i++) {
      const validation = this.validateAddress(client.deliveryAddresses[i], `entrega ${i + 1}`);
      if (validation) {
        return validation;
      }
    }

    return null;
  }

  private validateAddress(address: any, type: string): string | null {
    if (!address.residenceType) {
      return `Tipo de residência é obrigatório para endereço ${type}`;
    }

    if (!address.streetType) {
      return `Tipo de logradouro é obrigatório para endereço ${type}`;
    }

    if (!address.street) {
      return `Logradouro é obrigatório para endereço ${type}`;
    }

    if (!address.number) {
      return `Número é obrigatório para endereço ${type}`;
    }

    if (!address.neighborhood) {
      return `Bairro é obrigatório para endereço ${type}`;
    }

    if (!address.zipCode) {
      return `CEP é obrigatório para endereço ${type}`;
    }

    // Valida formato do CEP (XXXXX-XXX)
    const cepRegex = /^\d{5}-?\d{3}$/;
    if (!cepRegex.test(address.zipCode)) {
      return `CEP deve ter o formato XXXXX-XXX para endereço ${type}`;
    }

    if (!address.city) {
      return `Cidade é obrigatória para endereço ${type}`;
    }

    if (!address.city.state) {
      return `Estado é obrigatório para endereço ${type}`;
    }

    if (!address.city.state.country) {
      return `País é obrigatório para endereço ${type}`;
    }

    return null;
  }
}
