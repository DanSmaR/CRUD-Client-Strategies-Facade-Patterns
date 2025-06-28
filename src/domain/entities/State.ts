import { DomainEntity } from './DomainEntity';
import { Country } from './Country';

export class State extends DomainEntity {
  name: string;
  country: Country;
  
  constructor(name: string, country: Country) {
    super();
    this.name = name;
    this.country = country;
  }
}
