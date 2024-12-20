import axios from 'axios';
import { UserSignupPayload } from '../models/User';
import AuthService from './AuthService';

class UserService {
  private http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
  });

  async register(user: UserSignupPayload) {
    const res = await this.http.post<{ _id: string; username: string; email: string }>(
      '/users/signup',
      user
    );

    const token: string = res.headers['x-auth-token'];
    if (!token) {
      throw new Error('Authentication token missing from response');
    }

    AuthService.setUserSession(token);
    return token;
  }
}

export default new UserService();
