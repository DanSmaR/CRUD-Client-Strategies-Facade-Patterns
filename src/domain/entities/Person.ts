import { DomainEntity } from './DomainEntity';

export abstract class Person extends DomainEntity {
  private _name: string;
  private _cpf: string;
  
  constructor(name: string, cpf: string) {
    super();
    this._name = name;
    this._cpf = cpf;
  }

  // Getters
  get name(): string {
    return this._name;
  }

  get cpf(): string {
    return this._cpf;
  }

  // Setters
  set name(name: string) {
    this._name = name;
  }

  set cpf(cpf: string) {
    this._cpf = cpf;
  }
}
