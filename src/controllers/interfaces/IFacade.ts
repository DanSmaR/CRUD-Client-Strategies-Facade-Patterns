import { IDomainEntity } from '../../domain/interfaces/IDomainEntity';
import { IStrategy } from '../../strategies/interfaces/IStrategy';
import { IRepository } from '../../repositories/interfaces/IRepository';

export interface IFacade {
  registerStrategies(entityName: string, strategies: IStrategy<IDomainEntity>[]): void;
  registerRepository(entityName: string, repository: IRepository<IDomainEntity>): void;
  save(entity: IDomainEntity): Promise<string>;
  update(entity: IDomainEntity): Promise<string>;
  delete(id: string, entityType: string): Promise<string>;
  findById(id: string, entityType: string): Promise<IDomainEntity | null>;
  findAll(entityType: string): Promise<IDomainEntity[]>;
  findByFilter(filter: any, entityType: string): Promise<IDomainEntity[]>;
}
