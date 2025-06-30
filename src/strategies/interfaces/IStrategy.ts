import {DomainEntity} from "../../domain/entities/DomainEntity";

export interface IStrategy<T extends DomainEntity> {
  process(entity: T): Promise<string | null>;
}
