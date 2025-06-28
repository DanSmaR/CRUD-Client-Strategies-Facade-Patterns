import { DomainEntity } from './DomainEntity';
import { City } from './City';
import { ResidenceType, StreetType, AddressType } from './AddressTypes';

export class Address extends DomainEntity {
  residenceType: ResidenceType;
  streetType: StreetType;
  street: string;
  number: string;
  neighborhood: string;
  zipCode: string;
  city: City;
  addressType: AddressType;
  observations?: string;
  
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

  getFullAddress(): string {
    return `${this.streetType} ${this.street}, ${this.number} - ${this.neighborhood}, ${this.city.name} - ${this.city.state.name}, ${this.zipCode}`;
  }
}
