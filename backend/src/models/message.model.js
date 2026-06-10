const { DataTypes } = require('sequelize');
const { uuidv7 } = require('uuidv7');
const sequelize = require('../config/db');

const Message = sequelize.define(
  'Message',
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
        model: 'conversations', 
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },

    role: {
      type: DataTypes.ENUM('user', 'assistant'),
      allowNull: false,
      validate: {
        isIn: [['user', 'assistant']],
      },
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  },
  {
    tableName: 'messages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',

    indexes: [
      {
        fields: ['conversation_id'],
      },
      {
        fields: ['created_at'],
      },
      {
        fields: ['conversation_id', 'created_at'],
      },
    ],
  }
);

module.exports = Message;
