import {
  Model,
  DataTypes,
  Sequelize,
  Optional,
  CreationOptional,
} from "sequelize";

import { User } from "./User.model";

export enum TokenStatus {
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
  created_at: Date;
  used_at?: Date | null;
  status: TokenStatus;
  ip_address?: string | null;
  device_id: string;
  user_agent?: string | null;
}

export type RefreshTokenCreationAttributes = Optional<
  RefreshTokenAttributes,
  | "id"
  | "revoked"
  | "status"
  | "created_at"
  | "revoked_at"
  | "used_at"
  | "parent_jti"
  | "child_jti"
  | "ip_address"
  | "user_agent"
>;

export class RefreshToken
  extends Model<
    RefreshTokenAttributes,
    RefreshTokenCreationAttributes
  >
  implements RefreshTokenAttributes
{
  declare id: CreationOptional<string>;
  declare user_id: string;
  declare jti: string;
  declare session_id: string;
  declare parent_jti: string | null;
  declare child_jti: string | null;
  declare expires_at: Date;
  declare revoked: boolean;
  declare revoked_at: Date | null;
  declare created_at: CreationOptional<Date>;
  declare used_at: Date | null;
  declare status: TokenStatus;
  declare ip_address: string | null;
  declare device_id: string;
  declare user_agent: string | null;

  static initModel(sequelize: Sequelize) {
    RefreshToken.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },

        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "users",
            key: "id",
          },
          onDelete: "CASCADE",
          index: true,
        },

        jti: {
          type: DataTypes.UUID,
          allowNull: false,
          unique: true,
          index: true,
        },

        session_id: {
          type: DataTypes.UUID,
          allowNull: false,
          index: true,
        },

        parent_jti: {
          type: DataTypes.UUID,
          allowNull: true,
          references: {
            model: "refresh_tokens",
            key: "jti",
          },
          onDelete: "SET NULL",
        },

        child_jti: {
          type: DataTypes.UUID,
          allowNull: true,
          references: {
            model: "refresh_tokens",
            key: "jti",
          },
          onDelete: "SET NULL",
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
          type: DataTypes.ENUM(...Object.values(TokenStatus)),
          allowNull: false,
          defaultValue: TokenStatus.ACTIVE,
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
        timestamps: false,
        indexes: [
          { fields: ["user_id"] },
          { fields: ["jti"], unique: true },
          { fields: ["session_id"] },
          { fields: ["revoked"] },
          { fields: ["device_id"] },
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



