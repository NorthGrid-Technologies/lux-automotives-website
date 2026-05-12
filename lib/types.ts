export type VehicleClass = 'Super' | 'Sports' | 'Muscle' | 'SUV' | 'Motorcycle';
export type ModLevel = 'None' | 'Partial' | 'Complete';
export type VehicleCondition = 'Poor' | 'Fair' | 'Good' | 'Excellent';
export type VehicleStatus = 'available' | 'reserved' | 'sold';
export type AdminRole = 'owner' | 'manager';

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  class: VehicleClass;
  price: number;
  plate: string;
  mileage: number;
  fuelType: string;
  drivetrain: string;
  performanceMods: ModLevel;
  securityMods: ModLevel;
  handlingMods: ModLevel;
  condition: VehicleCondition;
  subwoofer: boolean;
  cargoSpace: number;
  insurancePerDay: number;
  status: VehicleStatus;
  featured: boolean;
  imageUrl: string;
  soldCount: number;
  createdAt: string;
}

export interface SaleRecord {
  id: string;
  vehicleId: string;
  vehicleLabel: string;
  price: number;
  buyerName: string;
  date: string;
}

export interface SellRequest {
  id: string;
  name: string;
  phone: string;
  brand: string;
  model: string;
  color: string;
  plate: string;
  askingPrice: number;
  condition: string;
  vehiclePictureUrl: string;
  notes: string;
  date: string;
  status: 'pending' | 'reviewed' | 'rejected';
}

export interface Career {
  id: string;
  title: string;
  department: string;
  description: string;
  requirements: string;
  active: boolean;
  createdAt: string;
}

export interface Partner {
  id: string;
  name: string;
  logoUrl: string;
  description: string;
  website: string;
  active: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  subject: string;
  message: string;
  date: string;
  read: boolean;
}

export interface AdminSession {
  username: string;
  role: AdminRole;
  loginTime: string;
}
