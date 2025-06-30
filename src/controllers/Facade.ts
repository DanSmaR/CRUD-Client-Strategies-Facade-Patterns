import { IFacade } from './interfaces/IFacade';
import { IStrategy } from '../strategies/interfaces/IStrategy';
import { IRepository } from '../repositories/interfaces/IRepository';
import {DomainEntity} from "../domain/entities/DomainEntity";

export class Facade implements IFacade {
  private strategies: Map<string, IStrategy<DomainEntity>[]>;
  private repositories: Map<string, IRepository<DomainEntity>>;
  
  constructor(strategies: Map<string, IStrategy<DomainEntity>[]> = new Map(), repositories: Map<string, IRepository<DomainEntity>> = new Map()) {
    this.strategies = strategies;
    this.repositories = repositories;
  }
  
  async save(entity: DomainEntity): Promise<string> {
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
  
  async update(entity: DomainEntity): Promise<string> {
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
  
  async findById(id: string, entityType: string): Promise<DomainEntity | null> {
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
  
  async findAll(entityType: string): Promise<DomainEntity[]> {
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

  async findByFilter(filter: any, entityType: string): Promise<DomainEntity[]> {
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
