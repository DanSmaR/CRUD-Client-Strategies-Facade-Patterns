import {DomainEntity} from "../../domain/entities/DomainEntity";

export interface IFacade {
  save(entity: DomainEntity): Promise<string>;
  update(entity: DomainEntity): Promise<string>;
  delete(id: string, entityType: string): Promise<string>;
  findById(id: string, entityType: string): Promise<DomainEntity | null>;
  findAll(entityType: string): Promise<DomainEntity[]>;
  findByFilter(filter: any, entityType: string): Promise<DomainEntity[]>;
}
