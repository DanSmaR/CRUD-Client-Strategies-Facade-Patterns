import {DomainEntity} from "../../domain/entities/DomainEntity";
import { IStrategy } from '../interfaces/IStrategy';

export class DateComplementStrategy implements IStrategy<DomainEntity
> {
  async process(entity: DomainEntity
): Promise<string | null> {
    if (!entity.createdAt) {
      entity.createdAt = new Date();
    }
    
    return null;
  }
}
