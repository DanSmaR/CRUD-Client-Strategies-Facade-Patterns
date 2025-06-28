import { IDomainEntity } from '../../domain/interfaces/IDomainEntity';

export interface IStrategy<T extends IDomainEntity> {
  process(entity: T): Promise<string | null>;
}
