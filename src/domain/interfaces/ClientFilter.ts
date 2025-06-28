import { Gender } from '../entities/Gender';
import { PhoneType } from '../entities/Phone';

export interface ClientFilter {
  // Basic identification fields
  name?: string;
  cpf?: string;
  email?: string;
  gender?: Gender;
  isActive?: boolean;
  
  // Phone filter
  phoneType?: PhoneType;
  areaCode?: string;
  phoneNumber?: string;
  
  // Date filters
  birthDateFrom?: Date;
  birthDateTo?: Date;
  createdAtFrom?: Date;
  createdAtTo?: Date;
  
  // Address filters
  street?: string;
  neighborhood?: string;
  zipCode?: string;
  city?: string;
  state?: string;
  country?: string;
  
  // Advanced filters
  ageFrom?: number;
  ageTo?: number;
}
