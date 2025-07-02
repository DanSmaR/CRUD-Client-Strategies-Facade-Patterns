import { DomainEntity } from './DomainEntity';
import { Country } from './Country';

export class State extends DomainEntity {
  private _name: string;
  private _country: Country;
  
  constructor(name: string, country: Country) {
    super();
    this._name = name;
    this._country = country;
  }

  // Getters
  get name(): string {
    return this._name;
  }

  get country(): Country {
    return this._country;
  }

  // Setters
  set name(name: string) {
    this._name = name;
  }

  set country(country: Country) {
    this._country = country;
  }
}
