/** Shape returned by GET /api/auth/me and used across the client. */
export interface AuthUser {
  id: string;
  email: string;
  fullname: string;
  role: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
