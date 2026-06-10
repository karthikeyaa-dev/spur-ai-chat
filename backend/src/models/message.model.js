const { uuidv7 } = require('uuidv7');

module.exports = (sequelize, DataTypes) => {
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

  Message.associate = (models) => {
    Message.belongsTo(models.Conversation, {
      foreignKey: 'conversation_id',
      onDelete: 'CASCADE',
    });
  };

  return Message;
};
