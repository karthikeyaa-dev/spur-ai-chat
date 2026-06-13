import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { registerSchema, loginSchema } from "../schemas/user.schema";

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      console.log("Register request body:", req.body);
      
      // Validate request body
      const parsed = registerSchema.safeParse(req.body);

      if (!parsed.success) {
        console.log("Validation failed:", parsed.error.format());
        return res.status(400).json({
          message: "Validation error",
          data: null,
          error: parsed.error.format(),
        });
      }

      console.log("Validation passed:", parsed.data);

      const result = await AuthService.register(parsed.data);

      return res.status(201).json({
        message: "User registered successfully",
        data: result,
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      return res.status(400).json({
        message: error?.message || "Something went wrong",
        data: null,
        error: error?.message || error,
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      console.log("Login request body:", req.body);
      
      // Validate request body
      const parsed = loginSchema.safeParse(req.body);

      if (!parsed.success) {
        console.log("Validation failed:", parsed.error.format());
        return res.status(400).json({
          message: "Validation error",
          data: null,
          error: parsed.error.format(),
        });
      }

      const result = await AuthService.login({
        email: parsed.data.email,
        password: parsed.data.password,
        ipAddress: req.ip || "",
        userAgent: req.headers["user-agent"] || "",
      });

      return res.status(200).json({
        message: "Login successful",
        data: result.user,
        access_token: result.access_token,
        refresh_token: result.refresh_token,
      });
    } catch (err: any) {
      console.error("Login error:", err);
      return res.status(401).json({
        message: err.message || "Login failed",
        data: null,
      });
    }
  }
}
