import { IDomainEntity } from '../interfaces/IDomainEntity';

export abstract class DomainEntity implements IDomainEntity {
  id?: string;
  createdAt?: Date;
  
  constructor() {
    this.createdAt = new Date();
  }
}
