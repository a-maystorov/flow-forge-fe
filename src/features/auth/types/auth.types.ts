export interface User {
  _id: string;
  username?: string;
  email?: string;
  iat: number;
  expiresAt?: string;
  isTemporary: boolean;
}

export interface TempSessionResponse {
  token: string;
  expiresAt: string;
  message: string;
}

export interface StoredSession {
  token: string;
  expiresAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  username: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  token: string;
  message: string;
}

export interface ConvertTempAccountResponse {
  token: string;
  message: string;
}
