export const ROLE_CODE = {
  ADMIN: "ADMIN",
  MENTOR: "MENTOR",
  PESERTA: "PESERTA",
} as const;

export type RoleCode = (typeof ROLE_CODE)[keyof typeof ROLE_CODE];

export const ADMIN_ROLES: RoleCode[] = [ROLE_CODE.ADMIN];
export const MENTOR_ROLES: RoleCode[] = [ROLE_CODE.ADMIN, ROLE_CODE.MENTOR];
export const ALL_ROLES: RoleCode[] = [
  ROLE_CODE.ADMIN,
  ROLE_CODE.MENTOR,
  ROLE_CODE.PESERTA,
];

export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 10,
} as const;
