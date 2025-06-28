import { Person } from './Person';
import { Address } from './Address';
import { Phone } from './Phone';
import { Gender } from './Gender';

export class Client extends Person {
  gender: Gender;
  birthDate: Date;
  phone: Phone;
  email: string;
  password: string;
  residentialAddress: Address;
  billingAddresses: Address[];
  deliveryAddresses: Address[];
  isActive: boolean;

  constructor(
    name: string,
    cpf: string,
    gender: Gender,
    birthDate: Date,
    phone: Phone,
    email: string,
    password: string,
    residentialAddress: Address,
    billingAddresses: Address[] = [],
    deliveryAddresses: Address[] = []
  ) {
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

  addBillingAddress(address: Address): void {
    this.billingAddresses.push(address);
  }

  addDeliveryAddress(address: Address): void {
    this.deliveryAddresses.push(address);
  }

  deactivate(): void {
    this.isActive = false;
  }

  activate(): void {
    this.isActive = true;
  }
}
