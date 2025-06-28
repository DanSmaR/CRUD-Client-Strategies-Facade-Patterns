"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Phone = exports.PhoneType = void 0;
var PhoneType;
(function (PhoneType) {
    PhoneType["RESIDENCIAL"] = "residencial";
    PhoneType["COMERCIAL"] = "comercial";
    PhoneType["CELULAR"] = "celular";
})(PhoneType || (exports.PhoneType = PhoneType = {}));
class Phone {
    constructor(type, areaCode, number) {
        this.type = type;
        this.areaCode = areaCode;
        this.number = number;
    }
    getFullNumber() {
        return `(${this.areaCode}) ${this.number}`;
    }
}
exports.Phone = Phone;
