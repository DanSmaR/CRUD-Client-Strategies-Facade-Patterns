import { IDomainEntity } from '../../domain/interfaces/IDomainEntity';
import { IStrategy } from '../interfaces/IStrategy';

export class DateComplementStrategy implements IStrategy<IDomainEntity> {
  async process(entity: IDomainEntity): Promise<string | null> {
    if (!entity.createdAt) {
      entity.createdAt = new Date();
    }
    
    return null;
  }
}
