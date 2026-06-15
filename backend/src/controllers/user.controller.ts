import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { UserRole } from "../models/user.model";

export class UserController {
  static async getAllUsers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const role = req.query.role as UserRole;
      const search = req.query.search as string;
      const is_active = req.query.is_active === 'true' ? true : 
                       req.query.is_active === 'false' ? false : undefined;

      const result = await UserService.getAllUsers({
        page,
        limit,
        role,
        search,
        is_active,
      });

      return res.status(200).json({
        message: "Users retrieved successfully",
        data: result.users,
        pagination: result.pagination,
        error: null,
      });
    } catch (err: any) {
      console.error("Get all users error:", err);
      return res.status(500).json({
        message: err.message || "Failed to get users",
        data: null,
        error: err.message || err,
      });
    }
  }

  static async getUserProfile(req: Request, res: Response) {
    try {
      // Fix: Cast userId to string
      const userId = req.params.userId as string;

      if (!userId) {
        return res.status(400).json({
          message: "User ID is required",
          data: null,
          error: "Missing user ID",
        });
      }

      const user = await UserService.getUserProfile(userId);

      return res.status(200).json({
        message: "User profile retrieved successfully",
        data: user,
        error: null,
      });
    } catch (err: any) {
      console.error("Get user profile error:", err);
      
      if (err.message === "User not found") {
        return res.status(404).json({
          message: err.message,
          data: null,
          error: err.message,
        });
      }
      
      return res.status(500).json({
        message: err.message || "Failed to get user profile",
        data: null,
        error: err.message || err,
      });
    }
  }

  static async getUserProfileByEmail(req: Request, res: Response) {
    try {
      const { email } = req.query;

      if (!email) {
        return res.status(400).json({
          message: "Email is required",
          data: null,
          error: "Missing email",
        });
      }

      const user = await UserService.getUserProfileByEmail(email as string);

      return res.status(200).json({
        message: "User profile retrieved successfully",
        data: user,
        error: null,
      });
    } catch (err: any) {
      console.error("Get user profile by email error:", err);
      
      if (err.message === "User not found") {
        return res.status(404).json({
          message: err.message,
          data: null,
          error: err.message,
        });
      }
      
      return res.status(500).json({
        message: err.message || "Failed to get user profile",
        data: null,
        error: err.message || err,
      });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const userId = req.params.userId as string;

      if (!userId) {
        return res.status(400).json({
          message: "User ID is required",
          data: null,
          error: "Missing user ID",
        });
      }

      const result = await UserService.deleteUser(userId);

      return res.status(200).json({
        message: result.message,
        data: null,
        error: null,
      });
    } catch (err: any) {
      console.error("Delete user error:", err);
      
      if (err.message === "User not found") {
        return res.status(404).json({
          message: err.message,
          data: null,
          error: err.message,
        });
      }
      
      return res.status(500).json({
        message: err.message || "Failed to delete user",
        data: null,
        error: err.message || err,
      });
    }
  }
}
