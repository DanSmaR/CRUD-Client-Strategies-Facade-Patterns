import { IDomainEntity } from '../../domain/interfaces/IDomainEntity';

export interface IRepository<T extends IDomainEntity> {
  save(entity: T): Promise<T>;
  update(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  findByFilter?(filter: any): Promise<T[]>;
}
