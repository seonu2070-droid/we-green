export interface Company {
  id: string;
  name: string;
  location: string;
  region: string;
  category: string;
  specialties: string[];
  tagline: string;
  area: string;
  address: string;
  phone: string;
  career: string;
  caseCount: string;
  status: string;
  image: string;
  description: string;
  gallery: string[];
  services: string[];
  isUserRegistered?: boolean;
  createdAt?: string;
}

export interface AuthUser {
  email: string;
  name: string;
  loggedInAt: string;
}

export interface Recommendation {
  companyId: string;
  reason: string;
}
