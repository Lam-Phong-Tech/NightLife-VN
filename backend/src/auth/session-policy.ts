export const SINGLE_PRIVILEGED_SESSION_ROLES = new Set([
  'SUPER_ADMIN',
  'ADMIN',
  'OPERATOR',
  'PARTNER',
  'STAFF',
]);

export const requiresSinglePrivilegedSession = (role?: string | null) =>
  Boolean(role && SINGLE_PRIVILEGED_SESSION_ROLES.has(role));

export const SESSION_REPLACED_ERROR = {
  code: 'SESSION_REPLACED',
  message: 'Tài khoản đã được đăng nhập trên trình duyệt hoặc thiết bị khác.',
} as const;

export const SESSION_ROLE_CHANGED_ERROR = {
  code: 'SESSION_ROLE_CHANGED',
  message: 'Quyền tài khoản đã thay đổi. Vui lòng đăng nhập lại.',
} as const;
