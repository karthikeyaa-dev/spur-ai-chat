import { 
  Model, 
  DataTypes, 
  Sequelize, 
  Optional,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
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
  session_id: string;
  user_id: string | null;
  status: ConversationStatus;
  created_at: CreationOptional<Date>;
  updated_at: CreationOptional<Date>;
}

// Define creation attributes (fields that are optional when creating)
export interface ConversationCreationAttributes
  extends Optional<ConversationAttributes, "id" | "status" | "created_at" | "updated_at"> {}

// Define the Conversation class
export class Conversation
  extends Model<ConversationAttributes, ConversationCreationAttributes>
  implements ConversationAttributes
{
  declare id: CreationOptional<string>;
  declare session_id: string;
  declare user_id: string | null;
  declare status: CreationOptional<ConversationStatus>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;

  // Association properties
  declare user?: User;
  declare messages?: Message[];
}

// Initialize the model
export const initConversationModel = (sequelize: Sequelize): typeof Conversation => {
  Conversation.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: () => uuidv7(),
      },
      session_id: {
        type: DataTypes.UUID,
        allowNull: false,
        validate: {
          isUUID: 4,
        },
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        validate: {
          isUUID: 4,
        },
      },
      status: {
        type: DataTypes.ENUM(...Object.values(ConversationStatus)),
        allowNull: false,
        defaultValue: ConversationStatus.ACTIVE,
        validate: {
          isIn: [Object.values(ConversationStatus)],
        },
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
          fields: ["session_id"],
          name: "conversations_session_id_idx",
        },
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
      ],
      hooks: {
        beforeUpdate: (conversation: Conversation) => {
          conversation.updated_at = new Date();
        },
      },
    }
  );

  return Conversation;
};

// Define associations
export const associateConversation = (models: any) => {
  const Conversation = models.Conversation;
  const User = models.User;
  const Message = models.Message;

  if (User && Conversation.belongsTo) {
    Conversation.belongsTo(User, {
      foreignKey: "user_id",
      as: "user",
      onDelete: "SET NULL",
    });
  }

  if (Message && Conversation.hasMany) {
    Conversation.hasMany(Message, {
      foreignKey: "conversation_id",
      as: "messages",
      onDelete: "CASCADE",
    });
  }
};

export default Conversation;
