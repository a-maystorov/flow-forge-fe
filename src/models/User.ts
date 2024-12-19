export interface User {
  _id: string;
  username?: string;
  email?: string;
  iat: number;
  isGuest?: boolean;
  guestExpiresAt?: string;
}

export type UserSignupPayload = Partial<User> & { password: string };
