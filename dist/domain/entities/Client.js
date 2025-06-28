"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const Person_1 = require("./Person");
class Client extends Person_1.Person {
    constructor(name, cpf, gender, birthDate, phone, email, password, residentialAddress, billingAddresses = [], deliveryAddresses = []) {
        super(name, cpf);
        this.gender = gender;
        this.birthDate = birthDate;
        this.phone = phone;
        this.email = email;
        this.password = password;
        this.residentialAddress = residentialAddress;
        this.billingAddresses = billingAddresses;
        this.deliveryAddresses = deliveryAddresses;
        this.isActive = true;
    }
    addBillingAddress(address) {
        this.billingAddresses.push(address);
    }
    addDeliveryAddress(address) {
        this.deliveryAddresses.push(address);
    }
    deactivate() {
        this.isActive = false;
    }
    activate() {
        this.isActive = true;
    }
}
exports.Client = Client;
