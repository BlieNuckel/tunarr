export enum Permission {
  NONE = 0,
  ADMIN = 2,
  MANAGE_USERS = 8,
  MANAGE_REQUESTS = 16,
  REQUEST = 32,
  AUTO_APPROVE = 128,
  REQUEST_VIEW = 16384,
}

type HasPermissionOptions = {
  mode?: "and" | "or";
};

export function hasPermission(
  userPermissions: number,
  required: Permission | Permission[],
  options?: HasPermissionOptions
): boolean {
  if ((userPermissions & Permission.ADMIN) !== 0) return true;

  if (Array.isArray(required)) {
    const mode = options?.mode ?? "or";
    return mode === "and"
      ? required.every((p) => (userPermissions & p) !== 0)
      : required.some((p) => (userPermissions & p) !== 0);
  }

  return (userPermissions & required) !== 0;
}

export const ADMIN_PERMISSIONS = Permission.ADMIN;
export const DEFAULT_USER_PERMISSIONS = Permission.REQUEST;
