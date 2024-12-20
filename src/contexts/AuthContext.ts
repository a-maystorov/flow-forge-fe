import { createContext } from 'react';
import { User } from '../models/User';

interface Props {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<Props | null>(null);

export default AuthContext;
