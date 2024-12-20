import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { User } from '../models/User';

const key = 'authToken';

// TODO: Adjust response type
interface GuestSessionResponse {
  token: string;
  isGuest: boolean;
  expiresAt: string;
  message: string;
}

interface StoredSession {
  token: string;
  isGuest: boolean;
  expiresAt?: string;
}

class AuthService {
  http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
  });

  async login(email: string, password: string): Promise<string> {
    const { data } = await this.http.post<{ token: string; isGuest: boolean }>('/auth/login', {
      email,
      password,
    });

    this.storeSession({ token: data.token, isGuest: false });
    this.setJwt(data.token);

    return data.token;
  }

  private storeSession(session: StoredSession): void {
    localStorage.setItem(key, JSON.stringify(session));
  }

  private getStoredSession(): StoredSession | null {
    const data = localStorage.getItem(key);
    if (!data) {
      return null;
    }
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  async logout(): Promise<void> {
    const session = this.getStoredSession();

    if (session?.isGuest) {
      try {
        this.setJwt(session.token);
        await this.http.post('/auth/guest-logout');
      } catch (error) {
        console.error('Error during guest logout:', error);
      }
    }

    localStorage.removeItem(key);
    if (this.http.defaults.headers && this.http.defaults.headers.common) {
      delete this.http.defaults.headers.common['x-auth-token'];
    }
  }

  getToken(): string | null {
    const session = this.getStoredSession();
    return session?.token || null;
  }

  getUser() {
    const session = this.getStoredSession();
    if (!session?.token) {
      return null;
    }

    try {
      const decoded = jwtDecode<User & { isGuest?: boolean }>(session.token);
      return {
        ...decoded,
        isGuest: session.isGuest,
        guestExpiresAt: session.expiresAt,
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  setJwt(jwt: string) {
    if (this.http.defaults.headers && this.http.defaults.headers.common) {
      this.http.defaults.headers.common['x-auth-token'] = jwt;
    }
  }

  setUserSession(token: string) {
    this.storeSession({ token, isGuest: false });
    this.setJwt(token);
  }

  async createGuestSession(): Promise<string> {
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      try {
        const { data } = await this.http.post<GuestSessionResponse>('/auth/guest-session');

        this.storeSession({
          token: data.token,
          isGuest: true,
          expiresAt: data.expiresAt,
        });
        this.setJwt(data.token);

        return data.token;
      } catch (error) {
        attempts++;
        if (attempts === maxAttempts) throw error;
        // Wait a short time before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    throw new Error('Failed to create guest session');
  }

  isTokenExpired(token: string) {
    const { exp } = jwtDecode<{ exp: number }>(token);
    return Date.now() >= exp * 1000;
  }
}

export default new AuthService();
