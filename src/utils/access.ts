import type { RoleName } from '../types';

export const managementRoles: RoleName[] = ['admin', 'manager'];

export const normalizeRoleName = (role?: string | null): RoleName | string => (role || '').toLowerCase();

export const canManageLms = (role?: string | null) => managementRoles.includes(normalizeRoleName(role) as RoleName);

export const canAccessRole = (role?: string | null, allowed?: string[]) => {
  if (!allowed || allowed.length === 0) return true;
  return allowed.includes(normalizeRoleName(role));
};
