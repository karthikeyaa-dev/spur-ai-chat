const sequelize = require('../config/db');

const User = require('./user.model');
const Conversation = require('./conversation.model');
const Message = require('./message.model');


// USER → CONVERSATIONS
User.hasMany(Conversation, {
  foreignKey: 'user_id',
  onDelete: 'SET NULL',
});
Conversation.belongsTo(User, {
  foreignKey: 'user_id',
});


// CONVERSATION → MESSAGES
Conversation.hasMany(Message, {
  foreignKey: 'conversation_id',
  onDelete: 'CASCADE',
});
Message.belongsTo(Conversation, {
	foreignKey: 'conversation_id',
});


module.exports = {
  sequelize,
  User,
  Conversation,
  Message,
  LLMRequest,
  FAQCategory,
  FAQItem,
};
