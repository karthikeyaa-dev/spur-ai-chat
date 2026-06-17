// src/models/oauth-account.model.ts

import { 
  Model, 
  DataTypes, 
  Sequelize, 
  CreationOptional, 
  ForeignKey,
  Optional
} from "sequelize";
import { uuidv7 } from "uuidv7";
import User from "./user.model";

export enum OAuthProvider {
  GOOGLE = "google",
  GITHUB = "github",
  FACEBOOK = "facebook",
  APPLE = "apple",
  MICROSOFT = "microsoft",
}

export interface OAuthAccountAttributes {
  id: string;
  user_id: string;
  provider: OAuthProvider;
  provider_user_id: string;
  provider_email: string | null;
  created_at: CreationOptional<Date>;
  updated_at: CreationOptional<Date>;
}

export type OAuthAccountCreationAttributes = Optional<
  OAuthAccountAttributes,
  "id" | "provider_email" | "created_at" | "updated_at"
>;

class OAuthAccount 
  extends Model<OAuthAccountAttributes, OAuthAccountCreationAttributes> 
  implements OAuthAccountAttributes 
{
  declare id: CreationOptional<string>;
  declare user_id: ForeignKey<string>;
  declare provider: OAuthProvider;
  declare provider_user_id: string;
  declare provider_email: string | null;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;

  static initModel(sequelize: Sequelize): typeof OAuthAccount {
    OAuthAccount.init(
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
        },
        provider: {
          type: DataTypes.ENUM(...Object.values(OAuthProvider)),
          allowNull: false,
        },
        provider_user_id: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        provider_email: {
          type: DataTypes.STRING(255),
          allowNull: true,
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
        tableName: "oauth_accounts",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        indexes: [
          {
            unique: true,
            fields: ["user_id", "provider"],
            name: "oauth_accounts_user_id_provider_unique",
          },
          {
            unique: true,
            fields: ["provider", "provider_user_id"],
            name: "oauth_accounts_provider_user_id_unique",
          },
          {
            fields: ["user_id"],
            name: "oauth_accounts_user_id_idx",
          },
          {
            fields: ["provider", "provider_user_id"],
            name: "oauth_accounts_provider_user_id_idx",
          },
        ],
      }
    );
    return OAuthAccount;
  }

  static associate(models: any) {
    OAuthAccount.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });
  }
}

export default OAuthAccount;
