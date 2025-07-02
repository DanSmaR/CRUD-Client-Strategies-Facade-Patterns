export enum PhoneType {
  RESIDENCIAL = 'residencial',
  COMERCIAL = 'comercial',
  CELULAR = 'celular'
}

export class Phone {
  private _type: PhoneType;
  private _areaCode: string;
  private _number: string;

  constructor(type: PhoneType, areaCode: string, number: string) {
    this._type = type;
    this._areaCode = areaCode;
    this._number = number;
  }

  // Getters
  get type(): PhoneType {
    return this._type;
  }

  get areaCode(): string {
    return this._areaCode;
  }

  get number(): string {
    return this._number;
  }

  // Setters
  set type(type: PhoneType) {
    this._type = type;
  }

  set areaCode(areaCode: string) {
    this._areaCode = areaCode;
  }

  set number(number: string) {
    this._number = number;
  }

  getFullNumber(): string {
    return `(${this._areaCode}) ${this._number}`;
  }
}
