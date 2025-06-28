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
exports.BirthDateValidationStrategy = void 0;
const Client_1 = require("../../domain/entities/Client");
class BirthDateValidationStrategy {
    process(entity) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(entity instanceof Client_1.Client)) {
                return null;
            }
            const client = entity;
            if (!client.birthDate) {
                return 'Data de nascimento é obrigatória';
            }
            const birthDate = new Date(client.birthDate);
            const today = new Date();
            if (birthDate > today) {
                return 'Data de nascimento não pode ser futura';
            }
            const minDate = new Date();
            minDate.setFullYear(today.getFullYear() - 16);
            if (birthDate > minDate) {
                return 'Cliente deve ter pelo menos 16 anos';
            }
            const maxDate = new Date();
            maxDate.setFullYear(today.getFullYear() - 120);
            if (birthDate < maxDate) {
                return 'Data de nascimento inválida';
            }
            return null;
        });
    }
}
exports.BirthDateValidationStrategy = BirthDateValidationStrategy;
