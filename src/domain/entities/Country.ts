import { DomainEntity } from './DomainEntity';

export class Country extends DomainEntity {
  name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }
}
