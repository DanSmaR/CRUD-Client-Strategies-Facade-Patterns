import { DomainEntity } from './DomainEntity';
import { State } from './State';

export class City extends DomainEntity {
  name: string;
  state: State;
  
  constructor(name: string, state: State) {
    super();
    this.name = name;
    this.state = state;
  }
}
