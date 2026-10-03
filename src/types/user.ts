export interface User {
  id: string;
  email: string;
  username: string | null;
  fullname: string;
  phone: string | null;
  city: string | null;
  province: string | null;
  avatar: string | null;
  isActive: boolean;
  roleId: string;
  role?: { id: string; code: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  code: string;
  name: string;
}
