"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.City = void 0;
const DomainEntity_1 = require("./DomainEntity");
class City extends DomainEntity_1.DomainEntity {
    constructor(name, state) {
        super();
        this.name = name;
        this.state = state;
    }
}
exports.City = City;
