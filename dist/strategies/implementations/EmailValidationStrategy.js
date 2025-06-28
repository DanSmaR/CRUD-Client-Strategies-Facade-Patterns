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
exports.EmailValidationStrategy = void 0;
const Client_1 = require("../../domain/entities/Client");
class EmailValidationStrategy {
    process(entity) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(entity instanceof Client_1.Client)) {
                return null;
            }
            const client = entity;
            if (!client.email) {
                return 'E-mail é obrigatório';
            }
            // Regex básico para validação de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(client.email)) {
                return 'E-mail deve ter um formato válido';
            }
            return null;
        });
    }
}
exports.EmailValidationStrategy = EmailValidationStrategy;
