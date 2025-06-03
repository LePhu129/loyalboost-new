import api from './api';
import { LoginCredentials, RegisterData, AuthResponse } from '@/types/auth';

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  }

  static async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  }

  static async getCurrentUser(): Promise<AuthResponse> {
    const response = await api.get<AuthResponse>('/auth/me');
    return response.data;
  }

  static logout(): void {
    localStorage.removeItem('token');
  }
} 