const { DataTypes } = require('sequelize');
const { uuidv7 } = require('uuidv7');
const sequelize = require('../config/db');

const Conversation = sequelize.define(
  'Conversation',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv7(),
    },

    session_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    user_id: {
      type: DataTypes.UUID,
      allowNull: true, // important for guest mode
    },

    status: {
      type: DataTypes.ENUM('active', 'closed'),
      defaultValue: 'active',
    },
  },
  {
    tableName: 'conversations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',

    indexes: [
      {
        fields: ['session_id'],
      },
      {
        fields: ['user_id'],
      },
    ],
  }
);

module.exports = Conversation;
