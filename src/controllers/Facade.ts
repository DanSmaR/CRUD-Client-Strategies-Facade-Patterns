import { IDomainEntity } from '../domain/interfaces/IDomainEntity';
import { IFacade } from './interfaces/IFacade';
import { IStrategy } from '../strategies/interfaces/IStrategy';
import { IRepository } from '../repositories/interfaces/IRepository';

export class Facade implements IFacade {
  private strategies: Map<string, IStrategy<IDomainEntity>[]>;
  private repositories: Map<string, IRepository<IDomainEntity>>;
  
  constructor() {
    this.strategies = new Map();
    this.repositories = new Map();
  }
  
  registerStrategies(entityName: string, strategies: IStrategy<IDomainEntity>[]): void {
    this.strategies.set(entityName, strategies);
  }
  
  registerRepository(entityName: string, repository: IRepository<IDomainEntity>): void {
    this.repositories.set(entityName, repository);
  }
  
  async save(entity: IDomainEntity): Promise<string> {
    try {
      const entityName = entity.constructor.name;
      const entityStrategies = this.strategies.get(entityName) || [];
      
      for (const strategy of entityStrategies) {
        const error = await strategy.process(entity);
        if (error) {
          return error;
        }
      }
      
      const repository = this.repositories.get(entityName);
      if (!repository) {
        return `Repositório não encontrado para a entidade ${entityName}`;
      }
      
      await repository.save(entity);
      
      return `${entityName} salvo com sucesso`;
    } catch (error) {
      return `Erro ao salvar ${entity.constructor.name}: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
  
  async update(entity: IDomainEntity): Promise<string> {
    try {
      const entityName = entity.constructor.name;
      const entityStrategies = this.strategies.get(entityName) || [];
      
      for (const strategy of entityStrategies) {
        const error = await strategy.process(entity);
        if (error) {
          return error;
        }
      }
      
      const repository = this.repositories.get(entityName);
      if (!repository) {
        return `Repositório não encontrado para a entidade ${entityName}`;
      }
      
      await repository.update(entity);
      
      return `${entityName} atualizado com sucesso`;
    } catch (error) {
      return `Erro ao atualizar ${entity.constructor.name}: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
  
  async delete(id: string, entityType: string): Promise<string> {
    try {
      const repository = this.repositories.get(entityType);
      if (!repository) {
        return `Repositório não encontrado para a entidade ${entityType}`;
      }
      
      const entity = await repository.findById(id);
      if (!entity) {
        return `${entityType} não encontrado`;
      }
      
      await repository.delete(id);
      
      return `${entityType} removido com sucesso`;
    } catch (error) {
      return `Erro ao remover ${entityType}: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
  
  async findById(id: string, entityType: string): Promise<IDomainEntity | null> {
    try {
      const repository = this.repositories.get(entityType);
      if (!repository) {
        console.error(`Repositório não encontrado para a entidade ${entityType}`);
        return null;
      }
      
      return await repository.findById(id);
    } catch (error) {
      console.error(`Erro ao buscar ${entityType}: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }
  
  async findAll(entityType: string): Promise<IDomainEntity[]> {
    try {
      const repository = this.repositories.get(entityType);
      if (!repository) {
        console.error(`Repositório não encontrado para a entidade ${entityType}`);
        return [];
      }
      
      return await repository.findAll();
    } catch (error) {
      console.error(`Erro ao listar ${entityType}: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }

  async findByFilter(filter: any, entityType: string): Promise<IDomainEntity[]> {
    try {
      const repository = this.repositories.get(entityType);
      if (!repository) {
        console.error(`Repositório não encontrado para a entidade ${entityType}`);
        return [];
      }
      
      if (repository.findByFilter) {
        return await repository.findByFilter(filter);
      } else {
        console.warn(`Método findByFilter não implementado para ${entityType}`);
        return await repository.findAll();
      }
    } catch (error) {
      console.error(`Erro ao filtrar ${entityType}: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }
}
