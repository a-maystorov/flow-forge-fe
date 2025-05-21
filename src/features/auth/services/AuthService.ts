import axios, { AxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';
import type {
  ConvertTempAccountResponse,
  RegisterResponse,
  StoredSession,
  TempSessionResponse,
  User,
} from '../types';

const AUTH_TOKEN_KEY = 'authToken';

class AuthService {
  private http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
  });

  constructor() {
    this.http.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers['x-auth-token'] = token;
      }
      return config;
    });
  }

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
      localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify({ token }));
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Login failed');
      }
      throw error;
    }
  }

  async signup(username: string, email: string, password: string): Promise<void> {
    try {
      const response = await this.http.post<RegisterResponse>('/auth/register', {
        email,
        password,
        username,
      });
      const { token } = response.data;

      localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify({ token }));
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Signup failed');
      }
      throw error;
    }
  }

  async createTempSession(): Promise<void> {
    try {
      // Check if we have a stored tempUserId from a previous session
      const tempUserId = localStorage.getItem('tempUserId');

      // Send the tempUserId if available so the backend can reuse the same user
      const response = await this.http.post<TempSessionResponse>(
        '/auth/temp-session',
        tempUserId ? { tempUserId } : {}
      );

      const { token, expiresAt } = response.data;
      localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify({ token, expiresAt }));

      // Clear the stored tempUserId as it's now been used
      if (tempUserId) {
        localStorage.removeItem('tempUserId');
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to create temporary session');
      }
      throw error;
    }
  }

  async logout(): Promise<void> {
    const user = this.getUser();
    if (user?.isTemporary) {
      // Store the temp user ID for possible reuse
      localStorage.setItem('tempUserId', user._id);
    }
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }

  async convertTempAccount(username: string, email: string, password: string): Promise<void> {
    try {
      const response = await this.http.post<ConvertTempAccountResponse>(
        '/auth/convert-temp-account',
        {
          email,
          password,
          username,
        }
      );
      const { token } = response.data;
      localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify({ token }));
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Account conversion failed');
      }
      throw error;
    }
  }
}

export const authService = new AuthService();
