import {
  Model,
  DataTypes,
  Sequelize,
  Optional,
  CreationOptional,
} from "sequelize";

import validator from "validator";
import { uuidv7 } from "uuidv7";

import {
  getPasswordHash,
  verifyPassword,
  isPasswordHashed,
} from "../utils/hash";

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

export interface UserAttributes {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export type UserCreationAttributes = Optional<
  UserAttributes,
  "id" | "role" | "is_active" | "created_at" | "updated_at"
>;

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  declare id: CreationOptional<string>;
  declare email: string;
  declare password: string;
  declare role: CreationOptional<UserRole>;
  declare is_active: CreationOptional<boolean>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;

  async checkPassword(rawPassword: string): Promise<boolean> {
    return verifyPassword(rawPassword, this.password);
  }

  static normalizeEmail(value: string): string {
    const cleaned = value.trim().toLowerCase();

    if (!validator.isEmail(cleaned)) {
      throw new Error("Invalid email address");
    }

    return cleaned;
  }

  async setPassword(rawPassword: string): Promise<void> {
    this.password = await this.hashPassword(rawPassword);
  }

  private async hashPassword(password: string): Promise<string> {
    if (!password) throw new Error("Password is required");

    if (isPasswordHashed(password)) {
      throw new Error("Password is already hashed");
    }

    if (password.length < 8)
      throw new Error("Password must be at least 8 characters long");

    if (password.length > 72)
      throw new Error("Password must be 72 characters or fewer");

    if (!/[A-Za-z]/.test(password))
      throw new Error("Password must contain at least one letter");

    if (!/[0-9]/.test(password))
      throw new Error("Password must contain at least one number");

    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password))
      throw new Error("Password must contain at least one special character");

    return getPasswordHash(password);
  }

  static initModel(sequelize: Sequelize) {
    User.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: (): string => uuidv7(),
        },

        email: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
          set(value: string) {
            this.setDataValue(
              "email",
              User.normalizeEmail(value)
            );
          },
        },

        password: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },

        role: {
          type: DataTypes.ENUM(...Object.values(UserRole)),
          allowNull: false,
          defaultValue: UserRole.USER,
        },

        is_active: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },

        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },

        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: "users",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      }
    );

    return User;
  }

  static associate(models: any) {
    User.hasMany(models.RefreshToken, {
      foreignKey: "user_id",
      as: "refresh_tokens",
      onDelete: "CASCADE",
    });
  }
}
