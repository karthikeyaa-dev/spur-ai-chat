import { Sequelize } from "sequelize";
import configFile from "../config/config";
import User from "./user.model";
import Conversation from "./conversation.model";
import Message from "./message.model";
import RefreshToken from "./RefreshToken.model";
import VerificationToken from "./VerificationToken.model";

// Determine environment
const env = process.env.NODE_ENV || "development";
const config = configFile[env];

// Initialize Sequelize
const sequelize = new Sequelize(
  config.database!,
  config.username!,
  config.password,
  config
);

// Initialize all models
User.initModel(sequelize);
Conversation.initModel(sequelize);
Message.initModel(sequelize);
RefreshToken.initModel(sequelize);
VerificationToken.initModel(sequelize);

// Set up associations
User.associate({ RefreshToken, Conversation, VerificationToken });
Conversation.associate({ User, Message });
Message.associate({ Conversation });
RefreshToken.associate({ User });
VerificationToken.associate({ User });

// Export
export {
  sequelize,
  Sequelize,
  User,
  Conversation,
  Message,
  RefreshToken,
  VerificationToken,
};

export default sequelize;
