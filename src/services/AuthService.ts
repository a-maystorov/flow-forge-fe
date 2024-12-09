import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const key = 'authToken';

class AuthService {
  http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
  });

  async login(email: string, password: string) {
    const { data } = await this.http.post<{ token: string }>('/auth/login', {
      email,
      password,
    });

    localStorage.setItem(key, data.token);
    this.setJwt(data.token);

    return data.token;
  }

  logout() {
    localStorage.removeItem(key);
    window.location.href = '/';
  }

  getToken() {
    return localStorage.getItem(key);
  }

  getUser() {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    try {
      return jwtDecode(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  setJwt(jwt: string) {
    if (axios.defaults.headers && axios.defaults.headers.common) {
      axios.defaults.headers.common['x-auth-token'] = jwt;
    }
  }

  isTokenExpired(token: string) {
    const { exp } = jwtDecode<{ exp: number }>(token);
    return Date.now() >= exp * 1000;
  }
}

export default new AuthService();
