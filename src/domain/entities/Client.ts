import { Person } from './Person';
import { Address } from './Address';
import { Phone } from './Phone';
import { Gender } from './Gender';

export class Client extends Person {
  private _gender: Gender;
  private _birthDate: Date;
  private _phone: Phone;
  private _email: string;
  private _password: string;
  private _residentialAddress: Address;
  private _billingAddresses: Address[];
  private _deliveryAddresses: Address[];
  private _isActive: boolean;

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
    this._gender = gender;
    this._birthDate = birthDate;
    this._phone = phone;
    this._email = email;
    this._password = password;
    this._residentialAddress = residentialAddress;
    this._billingAddresses = billingAddresses;
    this._deliveryAddresses = deliveryAddresses;
    this._isActive = true;
  }

  // Getters
  get gender(): Gender {
    return this._gender;
  }

  get birthDate(): Date {
    return this._birthDate;
  }

  get phone(): Phone {
    return this._phone;
  }

  get email(): string {
    return this._email;
  }

  get password(): string {
    return this._password;
  }

  get residentialAddress(): Address {
    return this._residentialAddress;
  }

  get billingAddresses(): Address[] {
    return [...this._billingAddresses]; // Return a copy to prevent external modification
  }

  get deliveryAddresses(): Address[] {
    return [...this._deliveryAddresses]; // Return a copy to prevent external modification
  }

  get isActive(): boolean {
    return this._isActive;
  }

  // Setters
  set gender(gender: Gender) {
    this._gender = gender;
  }

  set birthDate(birthDate: Date) {
    this._birthDate = birthDate;
  }

  set phone(phone: Phone) {
    this._phone = phone;
  }

  set email(email: string) {
    this._email = email;
  }

  set password(password: string) {
    this._password = password;
  }

  set residentialAddress(address: Address) {
    this._residentialAddress = address;
  }

  set isActive(isActive: boolean) {
    this._isActive = isActive;
  }

  addBillingAddress(address: Address): void {
    this._billingAddresses.push(address);
  }

  addDeliveryAddress(address: Address): void {
    this._deliveryAddresses.push(address);
  }

  removeBillingAddress(index: number): void {
    if (index >= 0 && index < this._billingAddresses.length) {
      this._billingAddresses.splice(index, 1);
    }
  }

  removeDeliveryAddress(index: number): void {
    if (index >= 0 && index < this._deliveryAddresses.length) {
      this._deliveryAddresses.splice(index, 1);
    }
  }

  clearBillingAddresses(): void {
    this._billingAddresses = [];
  }

  clearDeliveryAddresses(): void {
    this._deliveryAddresses = [];
  }

  deactivate(): void {
    this._isActive = false;
  }

  activate(): void {
    this._isActive = true;
  }
}
