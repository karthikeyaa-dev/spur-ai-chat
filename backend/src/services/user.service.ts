import { User, UserRole } from "../models/user.model";
import { Op } from "sequelize";
import { RefreshToken } from "../models/RefreshToken.model";

export class UserService {
  static async getUserProfile(userId: string) {
    const user = await User.findByPk(userId, {
      attributes: [
        'id',
        'email',
        'role',
        'is_active',
        'email_verified_at',
        'created_at',
        'updated_at'
      ],
    });

    if (!user) {
      throw new Error("User not found");
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      email_verified_at: user.email_verified_at,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  static async getUserProfileByEmail(email: string) {
    const user = await User.findOne({
      where: { email },
      attributes: [
        'id',
        'email',
        'role',
        'is_active',
        'created_at',
        'updated_at'
      ],
    });

    if (!user) {
      throw new Error("User not found");
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  static async getAllUsers(options?: {
    page?: number;
    limit?: number;
    role?: UserRole;
    search?: string;
    is_active?: boolean;
  }) {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const offset = (page - 1) * limit;

    const where: any = {};

    // Filter by role
    if (options?.role) {
      where.role = options.role;
    }

    // Filter by active status
    if (options?.is_active !== undefined) {
      where.is_active = options.is_active;
    }

    // Search by email or id
    if (options?.search) {
      where[Op.or] = [
        { email: { [Op.iLike]: `%${options.search}%` } },
        { id: { [Op.iLike]: `%${options.search}%` } },
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: [
        'id',
        'email',
        'role',
        'is_active',
        'created_at',
        'updated_at',
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    return {
      users: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  static async deleteUser(userId: string) {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new Error("User not found");
    }

    // Delete associated records (cascading should handle this, but explicit for safety)
    // Refresh tokens will be deleted via CASCADE
    // Conversations will be deleted or set to NULL via CASCADE/SET NULL
    // Verification tokens will be deleted via CASCADE
    
    await user.destroy();
    
    return { 
      success: true, 
      message: "User deleted successfully" 
    };
  }

  // Optional: Soft delete (just deactivate instead of hard delete)
  static async deactivateUser(userId: string) {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new Error("User not found");
    }

    user.is_active = false;
    await user.save();
    
    // Also revoke all refresh tokens for this user
    await RefreshToken.update(
      {
        revoked: true,
        revoked_at: new Date(),
      },
      {
        where: {
          user_id: userId,
          revoked: false,
        },
      }
    );
    
    return { 
      success: true, 
      message: "User deactivated successfully" 
    };
  }
}
