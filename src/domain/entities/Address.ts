import { DomainEntity } from './DomainEntity';
import { City } from './City';
import { ResidenceType, StreetType, AddressType } from './AddressTypes';

export class Address extends DomainEntity {
  private _residenceType: ResidenceType;
  private _streetType: StreetType;
  private _street: string;
  private _number: string;
  private _neighborhood: string;
  private _zipCode: string;
  private _city: City;
  private _addressType: AddressType;
  private _observations?: string;
  
  constructor(
    residenceType: ResidenceType,
    streetType: StreetType,
    street: string,
    number: string,
    neighborhood: string,
    zipCode: string,
    city: City,
    addressType: AddressType,
    observations?: string
  ) {
    super();
    this._residenceType = residenceType;
    this._streetType = streetType;
    this._street = street;
    this._number = number;
    this._neighborhood = neighborhood;
    this._zipCode = zipCode;
    this._city = city;
    this._addressType = addressType;
    this._observations = observations;
  }

  // Getters
  get residenceType(): ResidenceType {
    return this._residenceType;
  }

  get streetType(): StreetType {
    return this._streetType;
  }

  get street(): string {
    return this._street;
  }

  get number(): string {
    return this._number;
  }

  get neighborhood(): string {
    return this._neighborhood;
  }

  get zipCode(): string {
    return this._zipCode;
  }

  get city(): City {
    return this._city;
  }

  get addressType(): AddressType {
    return this._addressType;
  }

  get observations(): string | undefined {
    return this._observations;
  }

  // Setters
  set residenceType(residenceType: ResidenceType) {
    this._residenceType = residenceType;
  }

  set streetType(streetType: StreetType) {
    this._streetType = streetType;
  }

  set street(street: string) {
    this._street = street;
  }

  set number(number: string) {
    this._number = number;
  }

  set neighborhood(neighborhood: string) {
    this._neighborhood = neighborhood;
  }

  set zipCode(zipCode: string) {
    this._zipCode = zipCode;
  }

  set city(city: City) {
    this._city = city;
  }

  set addressType(addressType: AddressType) {
    this._addressType = addressType;
  }

  set observations(observations: string | undefined) {
    this._observations = observations;
  }

  getFullAddress(): string {
    return `${this._streetType} ${this._street}, ${this._number} - ${this._neighborhood}, ${this._city.name} - ${this._city.state.name}, ${this._zipCode}`;
  }
}
