import {DomainEntity} from "../../domain/entities/DomainEntity";

export interface IRepository<T extends DomainEntity> {
  save(entity: T): Promise<T>;
  update(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  findByFilter?(filter: any): Promise<T[]>;
}
