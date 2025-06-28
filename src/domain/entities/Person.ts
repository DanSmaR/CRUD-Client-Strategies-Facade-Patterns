import { DomainEntity } from './DomainEntity';

export abstract class Person extends DomainEntity {
  name: string;
  cpf: string;
  
  constructor(name: string, cpf: string) {
    super();
    this.name = name;
    this.cpf = cpf;
  }
}
