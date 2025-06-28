"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.State = void 0;
const DomainEntity_1 = require("./DomainEntity");
class State extends DomainEntity_1.DomainEntity {
    constructor(name, country) {
        super();
        this.name = name;
        this.country = country;
    }
}
exports.State = State;
