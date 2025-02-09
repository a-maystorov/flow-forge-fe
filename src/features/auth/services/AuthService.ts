import axios, { AxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';
import type { GuestSessionResponse, StoredSession, User } from '../types';

const AUTH_TOKEN_KEY = 'authToken';

class AuthService {
  private http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
  });

  private getStoredSession(): StoredSession | null {
    const stored = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  }

  getToken(): string | null {
    const session = this.getStoredSession();
    return session?.token ?? null;
  }

  getUser(): User | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode<User>(token);
      return decoded;
    } catch {
      return null;
    }
  }

  async login(email: string, password: string): Promise<void> {
    try {
      const response = await this.http.post('/auth/login', { email, password });
      const { token } = response.data;
      localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify({ token, isGuest: false }));
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Login failed');
      }
      throw error;
    }
  }

  async signup(username: string, email: string, password: string): Promise<void> {
    try {
      const response = await this.http.post('/users/signup', { email, password, username });
      const { token } = response.data;

      localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify({ token, isGuest: false }));
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Signup failed');
      }
      throw error;
    }
  }

  async createGuestSession(): Promise<void> {
    try {
      const response = await this.http.post<GuestSessionResponse>('/auth/guest-session');
      const { token, isGuest, expiresAt } = response.data;
      localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify({ token, isGuest, expiresAt }));
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to create guest session');
      }
      throw error;
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

export const authService = new AuthService();
