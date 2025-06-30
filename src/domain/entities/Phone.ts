import {DomainEntity} from "./DomainEntity";

export enum PhoneType {
  RESIDENCIAL = 'residencial',
  COMERCIAL = 'comercial',
  CELULAR = 'celular'
}

export class Phone extends DomainEntity {
  type: PhoneType;
  areaCode: string;
  number: string;

  constructor(type: PhoneType, areaCode: string, number: string) {
    super();
    this.type = type;
    this.areaCode = areaCode;
    this.number = number;
  }

  getFullNumber(): string {
    return `(${this.areaCode}) ${this.number}`;
  }
}
