import { DomainEntity } from './DomainEntity';

export class Country extends DomainEntity {
  private _name: string;

  constructor(name: string) {
    super();
    this._name = name;
  }

  // Getter
  get name(): string {
    return this._name;
  }

  // Setter
  set name(name: string) {
    this._name = name;
  }
}
