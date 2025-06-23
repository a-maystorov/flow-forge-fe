import axios, { AxiosError, AxiosInstance } from 'axios';
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
  private http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
    });

    this.http.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers['x-auth-token'] = token;
      }
      return config;
    });

    this.http.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          this.logout();
          window.location.href = '/welcome';
        }
        return Promise.reject(error);
      }
    );
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) {
      return true;
    }

    try {
      const decoded = jwtDecode<{ exp: number }>(token);
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
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
      if (this.isTokenExpired()) {
        this.logout();
        return null;
      }
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
      const tempUserId = localStorage.getItem('tempUserId');
      const response = await this.http.post<TempSessionResponse>(
        '/auth/temp-session',
        tempUserId ? { tempUserId } : {}
      );

      const { token, expiresAt } = response.data;
      localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify({ token, expiresAt }));

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
