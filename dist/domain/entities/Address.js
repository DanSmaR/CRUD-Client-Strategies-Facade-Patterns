"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Address = void 0;
const DomainEntity_1 = require("./DomainEntity");
class Address extends DomainEntity_1.DomainEntity {
    constructor(residenceType, streetType, street, number, neighborhood, zipCode, city, addressType, observations) {
        super();
        this.residenceType = residenceType;
        this.streetType = streetType;
        this.street = street;
        this.number = number;
        this.neighborhood = neighborhood;
        this.zipCode = zipCode;
        this.city = city;
        this.addressType = addressType;
        this.observations = observations;
    }
    getFullAddress() {
        return `${this.streetType} ${this.street}, ${this.number} - ${this.neighborhood}, ${this.city.name} - ${this.city.state.name}, ${this.zipCode}`;
    }
}
exports.Address = Address;
