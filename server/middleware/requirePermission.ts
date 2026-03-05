import type { Request, Response, NextFunction } from "express";
import { type Permission, hasPermission } from "../auth/permissions";

type RequirePermissionOptions = {
  mode?: "and" | "or";
};

export function requirePermission(
  required: Permission | Permission[],
  options?: RequirePermissionOptions
) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      const err = new Error("Authentication required") as Error & {
        status: number;
      };
      err.status = 401;
      return next(err);
    }

    if (!hasPermission(req.user.permissions, required, options)) {
      const err = new Error("Insufficient permissions") as Error & {
        status: number;
      };
      err.status = 403;
      return next(err);
    }

    next();
  };
}
