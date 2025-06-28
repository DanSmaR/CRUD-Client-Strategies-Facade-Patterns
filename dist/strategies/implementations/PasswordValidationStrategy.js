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
exports.PasswordValidationStrategy = void 0;
const Client_1 = require("../../domain/entities/Client");
class PasswordValidationStrategy {
    process(entity) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(entity instanceof Client_1.Client)) {
                return null;
            }
            const client = entity;
            if (!client.password) {
                return 'Senha é obrigatória';
            }
            if (client.password.length < 8) {
                return 'Senha deve ter pelo menos 8 caracteres';
            }
            if (client.password.length > 50) {
                return 'Senha não pode ter mais de 50 caracteres';
            }
            // Verifica se tem pelo menos uma letra minúscula
            if (!/[a-z]/.test(client.password)) {
                return 'Senha deve conter pelo menos uma letra minúscula';
            }
            // Verifica se tem pelo menos uma letra maiúscula
            if (!/[A-Z]/.test(client.password)) {
                return 'Senha deve conter pelo menos uma letra maiúscula';
            }
            // Verifica se tem pelo menos um número
            if (!/\d/.test(client.password)) {
                return 'Senha deve conter pelo menos um número';
            }
            // Verifica se tem pelo menos um caractere especial
            if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(client.password)) {
                return 'Senha deve conter pelo menos um caractere especial';
            }
            return null;
        });
    }
}
exports.PasswordValidationStrategy = PasswordValidationStrategy;
