"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Facade = void 0;
class Facade {
    constructor() {
        this.strategies = new Map();
        this.repositories = new Map();
    }
    registerStrategies(entityName, strategies) {
        this.strategies.set(entityName, strategies);
    }
    registerRepository(entityName, repository) {
        this.repositories.set(entityName, repository);
    }
    save(entity) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const entityName = entity.constructor.name;
                const entityStrategies = this.strategies.get(entityName) || [];
                for (const strategy of entityStrategies) {
                    const error = yield strategy.process(entity);
                    if (error) {
                        return error;
                    }
                }
                const repository = this.repositories.get(entityName);
                if (!repository) {
                    return `Repositório não encontrado para a entidade ${entityName}`;
                }
                yield repository.save(entity);
                return `${entityName} salvo com sucesso`;
            }
            catch (error) {
                return `Erro ao salvar ${entity.constructor.name}: ${error instanceof Error ? error.message : String(error)}`;
            }
        });
    }
    update(entity) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const entityName = entity.constructor.name;
                const entityStrategies = this.strategies.get(entityName) || [];
                for (const strategy of entityStrategies) {
                    const error = yield strategy.process(entity);
                    if (error) {
                        return error;
                    }
                }
                const repository = this.repositories.get(entityName);
                if (!repository) {
                    return `Repositório não encontrado para a entidade ${entityName}`;
                }
                yield repository.update(entity);
                return `${entityName} atualizado com sucesso`;
            }
            catch (error) {
                return `Erro ao atualizar ${entity.constructor.name}: ${error instanceof Error ? error.message : String(error)}`;
            }
        });
    }
    delete(id, entityType) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const repository = this.repositories.get(entityType);
                if (!repository) {
                    return `Repositório não encontrado para a entidade ${entityType}`;
                }
                const entity = yield repository.findById(id);
                if (!entity) {
                    return `${entityType} não encontrado`;
                }
                yield repository.delete(id);
                return `${entityType} removido com sucesso`;
            }
            catch (error) {
                return `Erro ao remover ${entityType}: ${error instanceof Error ? error.message : String(error)}`;
            }
        });
    }
    findById(id, entityType) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const repository = this.repositories.get(entityType);
                if (!repository) {
                    console.error(`Repositório não encontrado para a entidade ${entityType}`);
                    return null;
                }
                return yield repository.findById(id);
            }
            catch (error) {
                console.error(`Erro ao buscar ${entityType}: ${error instanceof Error ? error.message : String(error)}`);
                return null;
            }
        });
    }
    findAll(entityType) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const repository = this.repositories.get(entityType);
                if (!repository) {
                    console.error(`Repositório não encontrado para a entidade ${entityType}`);
                    return [];
                }
                return yield repository.findAll();
            }
            catch (error) {
                console.error(`Erro ao listar ${entityType}: ${error instanceof Error ? error.message : String(error)}`);
                return [];
            }
        });
    }
    findByFilter(filter, entityType) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const repository = this.repositories.get(entityType);
                if (!repository) {
                    console.error(`Repositório não encontrado para a entidade ${entityType}`);
                    return [];
                }
                if (repository.findByFilter) {
                    return yield repository.findByFilter(filter);
                }
                else {
                    console.warn(`Método findByFilter não implementado para ${entityType}`);
                    return yield repository.findAll();
                }
            }
            catch (error) {
                console.error(`Erro ao filtrar ${entityType}: ${error instanceof Error ? error.message : String(error)}`);
                return [];
            }
        });
    }
}
exports.Facade = Facade;
