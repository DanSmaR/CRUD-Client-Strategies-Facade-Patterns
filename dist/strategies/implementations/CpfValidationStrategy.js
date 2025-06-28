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
exports.CpfValidationStrategy = void 0;
class CpfValidationStrategy {
    process(client) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!client.cpf) {
                return "CPF é obrigatório";
            }
            const cpf = client.cpf.replace(/[^\d]/g, '');
            if (cpf.length !== 11) {
                return "CPF deve conter 11 dígitos";
            }
            // Verifica se todos os dígitos são iguais
            if (/^(\d)\1+$/.test(cpf)) {
                return "CPF inválido";
            }
            // Validação do primeiro dígito verificador
            let soma = 0;
            for (let i = 0; i < 9; i++) {
                soma += parseInt(cpf.charAt(i)) * (10 - i);
            }
            let resto = soma % 11;
            let digitoVerificador1 = resto < 2 ? 0 : 11 - resto;
            if (parseInt(cpf.charAt(9)) !== digitoVerificador1) {
                return "CPF inválido";
            }
            // Validação do segundo dígito verificador
            soma = 0;
            for (let i = 0; i < 10; i++) {
                soma += parseInt(cpf.charAt(i)) * (11 - i);
            }
            resto = soma % 11;
            let digitoVerificador2 = resto < 2 ? 0 : 11 - resto;
            if (parseInt(cpf.charAt(10)) !== digitoVerificador2) {
                return "CPF inválido";
            }
            return null;
        });
    }
}
exports.CpfValidationStrategy = CpfValidationStrategy;
