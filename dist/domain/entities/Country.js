"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Country = void 0;
const DomainEntity_1 = require("./DomainEntity");
class Country extends DomainEntity_1.DomainEntity {
    constructor(name) {
        super();
        this.name = name;
    }
}
exports.Country = Country;
