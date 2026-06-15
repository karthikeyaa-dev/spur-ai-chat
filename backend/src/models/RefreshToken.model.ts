import { 
  Model, 
  DataTypes, 
  Sequelize, 
  Optional,
  CreationOptional,
  ForeignKey
} from "sequelize";
import { uuidv7 } from "uuidv7";

import type { User } from "./user.model";

// Define enum for token status
export enum RefreshTokenStatus {
  ACTIVE = "active",
  USED = "used",
  REVOKED = "revoked",
}

export interface RefreshTokenAttributes {
  id: string;
  user_id: string;
  jti: string;
  session_id: string;
  parent_jti?: string | null;
  child_jti?: string | null;
  expires_at: Date;
  revoked: boolean;
  revoked_at?: Date | null;
  created_at: CreationOptional<Date>;
  used_at?: Date | null;
  status: RefreshTokenStatus;
  ip_address?: string | null;
  device_id: string;
  user_agent?: string | null;
}

export interface RefreshTokenCreationAttributes
  extends Optional<RefreshTokenAttributes, 
    "id" | "revoked" | "revoked_at" | "created_at" | "used_at" | "status" | "ip_address" | "user_agent" | "parent_jti" | "child_jti"
  > {}

export class RefreshToken
  extends Model<RefreshTokenAttributes, RefreshTokenCreationAttributes>
  implements RefreshTokenAttributes
{
  declare id: CreationOptional<string>;
  declare user_id: ForeignKey<string>;
  declare jti: string;
  declare session_id: string;
  declare parent_jti: string | null;
  declare child_jti: string | null;
  declare expires_at: Date;
  declare revoked: CreationOptional<boolean>;
  declare revoked_at: Date | null;
  declare created_at: CreationOptional<Date>;
  declare used_at: Date | null;
  declare status: CreationOptional<RefreshTokenStatus>;
  declare ip_address: string | null;
  declare device_id: string;
  declare user_agent: string | null;

  // Association properties
  declare user?: User;

  static initModel(sequelize: Sequelize): typeof RefreshToken {
    RefreshToken.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: (): string => uuidv7(),
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "users",
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        jti: {
          type: DataTypes.UUID,
          allowNull: false,
          unique: true,
        },
        session_id: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        parent_jti: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        child_jti: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        expires_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        revoked: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        revoked_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        used_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM(...Object.values(RefreshTokenStatus)),
          allowNull: false,
          defaultValue: RefreshTokenStatus.ACTIVE,
        },
        ip_address: {
          type: DataTypes.STRING(45),
          allowNull: true,
        },
        device_id: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        user_agent: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "refresh_tokens",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: false, // Migration doesn't have updated_at
        indexes: [
          {
            fields: ["user_id"],
            name: "idx_refresh_tokens_user_id",
          },
          {
            unique: true,
            fields: ["jti"],
            name: "idx_refresh_tokens_jti",
          },
          {
            fields: ["session_id"],
            name: "idx_refresh_tokens_session_id",
          },
          {
            fields: ["status"],
            name: "idx_refresh_tokens_status",
          },
          {
            fields: ["expires_at"],
            name: "idx_refresh_tokens_expires_at",
          },
        ],
      }
    );
    return RefreshToken;
  }

  static associate(models: any) {
    RefreshToken.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });
  }
}

export default RefreshToken;
