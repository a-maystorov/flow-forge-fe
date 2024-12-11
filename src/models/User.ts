export interface User {
  _id: string;
  username: string;
  email: string;
  iat: number;
}

export type UserSignupPayload = Partial<User> & { password: string };
