import { DomainEntity } from './DomainEntity';
import { State } from './State';

export class City extends DomainEntity {
  private _name: string;
  private _state: State;
  
  constructor(name: string, state: State) {
    super();
    this._name = name;
    this._state = state;
  }

  // Getters
  get name(): string {
    return this._name;
  }

  get state(): State {
    return this._state;
  }

  // Setters
  set name(name: string) {
    this._name = name;
  }

  set state(state: State) {
    this._state = state;
  }
}
