export interface User {
  _id: string;
  username?: string;
  email?: string;
  iat: number;
  expiresAt?: string;
}

export type UserSignupPayload = Partial<User> & { password: string };
