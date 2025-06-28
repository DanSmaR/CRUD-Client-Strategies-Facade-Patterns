"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Person = void 0;
const DomainEntity_1 = require("./DomainEntity");
class Person extends DomainEntity_1.DomainEntity {
    constructor(name, cpf) {
        super();
        this.name = name;
        this.cpf = cpf;
    }
}
exports.Person = Person;
