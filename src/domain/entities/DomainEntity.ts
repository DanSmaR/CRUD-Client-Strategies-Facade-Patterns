import { IDomainEntity } from '../interfaces/IDomainEntity';

export abstract class DomainEntity implements IDomainEntity {
  private _id?: string;
  private _createdAt?: Date;
  
  constructor() {
    this._createdAt = new Date();
  }

  // Getters
  get id(): string | undefined {
    return this._id;
  }

  get createdAt(): Date | undefined {
    return this._createdAt;
  }

  // Setters
  set id(id: string | undefined) {
    this._id = id;
  }

  set createdAt(createdAt: Date | undefined) {
    this._createdAt = createdAt;
  }
}
