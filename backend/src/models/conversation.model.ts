import { 
  Model, 
  DataTypes, 
  Sequelize, 
  Optional,
  CreationOptional,
  ForeignKey
} from "sequelize";
import { uuidv7 } from "uuidv7";

// Import related models (will be used in associations)
import type { User } from "./user.model";
import type { Message } from "./message.model";

// Define enum for conversation status
export enum ConversationStatus {
  ACTIVE = "active",
  CLOSED = "closed",
}

// Define attributes for Conversation model
export interface ConversationAttributes {
  id: string;
  user_id: string;  // Made required - always links to a user
  title: string | null;
  status: ConversationStatus;
  created_at: CreationOptional<Date>;
  updated_at: CreationOptional<Date>;
}

// Define creation attributes
export interface ConversationCreationAttributes
  extends Optional<ConversationAttributes, "id" | "title" | "status" | "created_at" | "updated_at"> {}

// Define the Conversation class
export class Conversation
  extends Model<ConversationAttributes, ConversationCreationAttributes>
  implements ConversationAttributes
{
  declare id: CreationOptional<string>;
  declare user_id: ForeignKey<string>;  // Required - no longer nullable
  declare title: string | null;
  declare status: CreationOptional<ConversationStatus>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;

  // Association properties
  declare user?: User;
  declare messages?: Message[];

  static initModel(sequelize: Sequelize): typeof Conversation {
    Conversation.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: (): string => uuidv7(),
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,  // Required
          references: {
            model: "users",
            key: "id",
          },
          onDelete: "CASCADE",  // Delete conversations when user is deleted
        },
        title: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM(...Object.values(ConversationStatus)),
          allowNull: false,
          defaultValue: ConversationStatus.ACTIVE,
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
        tableName: "conversations",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        indexes: [
          {
            fields: ["user_id"],
            name: "conversations_user_id_idx",
          },
          {
            fields: ["status"],
            name: "conversations_status_idx",
          },
          {
            fields: ["created_at"],
            name: "conversations_created_at_idx",
          },
          {
            fields: ["user_id", "status"],
            name: "conversations_user_id_status_idx",
          },
        ],
        hooks: {
          beforeUpdate: (conversation: Conversation) => {
            conversation.updated_at = new Date();
          },
        },
      }
    );

    return Conversation;
  }

  static associate(models: any) {
    const { User, Message } = models;
    
    if (User) {
      Conversation.belongsTo(User, {
        foreignKey: "user_id",
        as: "user",
        onDelete: "CASCADE",
      });
    }

    if (Message) {
      Conversation.hasMany(Message, {
        foreignKey: "conversation_id",
        as: "messages",
        onDelete: "CASCADE",
      });
    }
  }
}

export default Conversation;
