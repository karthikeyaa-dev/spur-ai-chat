import { Model, DataTypes, Sequelize, CreationOptional, ForeignKey, Optional} from "sequelize";
import { uuidv7 } from "uuidv7";

export enum VerificationTokenType {
  EMAIL_VERIFICATION = "email_verification",
  PASSWORD_RESET = "password_reset",
}

export interface VerificationTokenAttributes {
  id: string;
  user_id: string;
  token_hash: string;
  type: VerificationTokenType;
  expires_at: Date;
  used: boolean;
  used_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export type VerificationTokenCreationAttributes = Optional<
  VerificationTokenAttributes,
  "id" | "used" | "used_at" | "created_at" | "updated_at"
>;

class VerificationToken
  extends Model<VerificationTokenAttributes, VerificationTokenCreationAttributes>
  implements VerificationTokenAttributes
{
  declare id: CreationOptional<string>;
  declare user_id: ForeignKey<string>;
  declare token_hash: string;
  declare type: VerificationTokenType;
  declare expires_at: Date;
  declare used: CreationOptional<boolean>;
  declare used_at: Date | null;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;

  static initModel(sequelize: Sequelize): typeof VerificationToken {
    VerificationToken.init(
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
        token_hash: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
        },
        type: {
          type: DataTypes.ENUM(...Object.values(VerificationTokenType)),
          allowNull: false,
        },
        expires_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        used: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        used_at: {
          type: DataTypes.DATE,
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
        tableName: "verification_tokens",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      }
    );
    return VerificationToken;
  }

  static associate(models: any) {
    VerificationToken.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });
  }
}

export default VerificationToken;
export { VerificationToken };
