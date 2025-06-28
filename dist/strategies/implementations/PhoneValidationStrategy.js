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
exports.PhoneValidationStrategy = void 0;
const Client_1 = require("../../domain/entities/Client");
class PhoneValidationStrategy {
    process(entity) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(entity instanceof Client_1.Client)) {
                return null;
            }
            const client = entity;
            if (!client.phone) {
                return 'Telefone é obrigatório';
            }
            if (!client.phone.areaCode || client.phone.areaCode.length !== 2) {
                return 'DDD deve ter 2 dígitos';
            }
            if (!client.phone.number || client.phone.number.length < 8 || client.phone.number.length > 9) {
                return 'Número de telefone deve ter entre 8 e 9 dígitos';
            }
            // Verifica se são apenas números
            if (!/^\d+$/.test(client.phone.areaCode) || !/^\d+$/.test(client.phone.number)) {
                return 'Telefone deve conter apenas números';
            }
            return null;
        });
    }
}
exports.PhoneValidationStrategy = PhoneValidationStrategy;
