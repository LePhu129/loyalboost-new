export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  membershipTier: string;
  totalPoints: number;
  phoneNumber?: string;
  barcode: string;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AuthError {
  error: string;
  details?: string[];
} 