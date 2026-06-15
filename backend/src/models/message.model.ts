import { 
  Model, 
  DataTypes, 
  Sequelize, 
  Optional,
  CreationOptional,
  ForeignKey
} from "sequelize";
import { uuidv7 } from "uuidv7";

import type { Conversation } from "./conversation.model";

// Define enum for message role
export enum MessageRole {
  USER = "user",
  ASSISTANT = "assistant",
  SYSTEM = "system",
}

// Define attributes for Message model
export interface MessageAttributes {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  created_at: CreationOptional<Date>;
}

// Define creation attributes
export interface MessageCreationAttributes
  extends Optional<MessageAttributes, "id" | "created_at"> {}

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

  // Association properties
  declare conversation?: Conversation;

  static initModel(sequelize: Sequelize): typeof Message {
    Message.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: (): string => uuidv7(),
        },
        conversation_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "conversations",
            key: "id",
          },
        },
        role: {
          type: DataTypes.ENUM(...Object.values(MessageRole)),
          allowNull: false,
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        created_at: {
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
        updatedAt: false,
        indexes: [
          {
            fields: ["conversation_id"],
            name: "messages_conversation_id_idx",
          },
          {
            fields: ["created_at"],
            name: "messages_created_at_idx",
          },
        ],
      }
    );

    return Message;
  }

  static associate(models: any) {
    const { Conversation } = models;
    
    if (Conversation) {
      Message.belongsTo(Conversation, {
        foreignKey: "conversation_id",
        as: "conversation",
      });
    }
  }
}

export default Message;
