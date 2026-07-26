export const SINGLE_PRIVILEGED_SESSION_ROLES = new Set([
  'SUPER_ADMIN',
  'ADMIN',
  'OPERATOR',
  'PARTNER',
  'STAFF',
]);

export const requiresSinglePrivilegedSession = (role?: string | null) =>
  Boolean(role && SINGLE_PRIVILEGED_SESSION_ROLES.has(role));

export const maskIpAddress = (ip?: string | null): string | null => {
  if (!ip) {
    return null;
  }
  const normalized = ip.startsWith('::ffff:') ? ip.slice('::ffff:'.length) : ip;
  const ipv4Match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.\d{1,3}$/.exec(normalized);
  if (ipv4Match) {
    return `${ipv4Match[1]}.${ipv4Match[2]}.${ipv4Match[3]}.xxx`;
  }
  if (normalized.includes(':')) {
    const groups = normalized.split(':').filter(Boolean);
    if (groups.length <= 3) {
      return normalized;
    }
    return `${groups.slice(0, 3).join(':')}:…`;
  }
  return normalized;
};

export const SESSION_REPLACED_ERROR = {
  code: 'SESSION_REPLACED',
  message: 'Tài khoản đã được đăng nhập trên trình duyệt hoặc thiết bị khác.',
} as const;

export const SESSION_ROLE_CHANGED_ERROR = {
  code: 'SESSION_ROLE_CHANGED',
  message: 'Quyền tài khoản đã thay đổi. Vui lòng đăng nhập lại.',
} as const;
