export interface User {
  _id: string;
  username?: string;
  email?: string;
  iat: number;
  isGuest?: boolean;
  guestExpiresAt?: string;
}

export interface GuestSessionResponse {
  token: string;
  isGuest: boolean;
  expiresAt: string;
  message: string;
}

export interface StoredSession {
  token: string;
  isGuest: boolean;
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
