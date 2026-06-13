import { 
  Model, 
  DataTypes, 
  Sequelize, 
  Optional,
  CreationOptional,
  ForeignKey
} from "sequelize";
import { uuidv7 } from "uuidv7";

// Import related model
import type { Conversation } from "./conversation.model";

// Define enum for message role
export enum MessageRole {
  USER = "user",
  ASSISTANT = "assistant",
}

// Define attributes for Message model
export interface MessageAttributes {
  id: string;
  conversation_id: ForeignKey<string>;
  role: MessageRole;
  content: string;
  created_at: CreationOptional<Date>;
  updated_at: CreationOptional<Date>;
}

// Define creation attributes (fields that are optional when creating)
export interface MessageCreationAttributes
  extends Optional<MessageAttributes, "id" | "created_at" | "updated_at"> {}

// Define the Message class
export class Message
  extends Model<MessageAttributes, MessageCreationAttributes>
  implements MessageAttributes
{
  declare id: CreationOptional<string>;
  declare conversation_id: ForeignKey<string>;
  declare role: MessageRole;
  declare content: string;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;

  // Association properties
  declare conversation?: Conversation;
}

// Initialize the model
export const initMessageModel = (sequelize: Sequelize): typeof Message => {
  Message.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: () => uuidv7(),
      },
      conversation_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "conversations",
          key: "id",
        },
        validate: {
          isUUID: 4,
        },
      },
      role: {
        type: DataTypes.ENUM(...Object.values(MessageRole)),
        allowNull: false,
        validate: {
          isIn: [Object.values(MessageRole)],
        },
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Message content cannot be empty",
          },
          len: {
            args: [1, 10000],
            msg: "Message content must be between 1 and 10000 characters",
          },
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
      tableName: "messages",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          fields: ["conversation_id"],
          name: "messages_conversation_id_idx",
        },
        {
          fields: ["created_at"],
          name: "messages_created_at_idx",
        },
        {
          fields: ["conversation_id", "created_at"],
          name: "messages_conversation_created_at_idx",
        },
        {
          fields: ["role"],
          name: "messages_role_idx",
        },
      ],
      hooks: {
        beforeUpdate: (message: Message) => {
          message.updated_at = new Date();
        },
        beforeCreate: (message: Message) => {
          // Ensure content is trimmed
          if (message.content) {
            message.content = message.content.trim();
          }
        },
      },
    }
  );

  return Message;
};

// Define associations
export const associateMessage = (models: any) => {
  const Message = models.Message;
  const Conversation = models.Conversation;

  if (Conversation && Message.belongsTo) {
    Message.belongsTo(Conversation, {
      foreignKey: "conversation_id",
      as: "conversation",
      onDelete: "CASCADE",
    });
  }
};

export default Message;
