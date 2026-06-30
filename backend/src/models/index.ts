import { Sequelize } from "sequelize";
import User from "./user.model";
import Conversation from "./conversation.model";
import Message from "./message.model";
import RefreshToken from "./RefreshToken.model";
import VerificationToken from "./VerificationToken.model";
import OAuthAccount from "./OauthAccount.model";

// Initialize Sequelize from environment variables
const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASSWORD!,
  {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    dialect: "postgres",
    logging: false,
  }
);

// Initialize all models
User.initModel(sequelize);
Conversation.initModel(sequelize);
Message.initModel(sequelize);
RefreshToken.initModel(sequelize);
VerificationToken.initModel(sequelize);
OAuthAccount.initModel(sequelize);

// Set up associations
User.associate({ RefreshToken, Conversation, VerificationToken, OAuthAccount });
Conversation.associate({ User, Message });
Message.associate({ Conversation });
RefreshToken.associate({ User });
VerificationToken.associate({ User });
OAuthAccount.associate({ User });

export {
  sequelize,
  Sequelize,
  User,
  Conversation,
  Message,
  RefreshToken,
  VerificationToken,
  OAuthAccount,
};

export default sequelize;
