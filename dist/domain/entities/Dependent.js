"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dependent = void 0;
const Person_1 = require("./Person");
class Dependent extends Person_1.Person {
    constructor(name, relationship) {
        super(name);
        this.relationship = relationship;
    }
}
exports.Dependent = Dependent;
