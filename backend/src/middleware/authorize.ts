import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/authRequest";

type Role = "user" | "admin";

export function authorize(...allowedRoles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: Login required" });
    }

    if (!user.role) {
      return res.status(403).json({ message: "Forbidden: Role missing" });
    }

    if (!allowedRoles.includes(user.role as Role)) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }

    next();
  };
}
