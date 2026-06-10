const { uuidv7 } = require('uuidv7');

module.exports = (sequelize, DataTypes) => {
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
        allowNull: true,
      },

      status: {
        type: DataTypes.ENUM('active', 'closed'),
        allowNull: false,
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

  Conversation.associate = (models) => {
    Conversation.belongsTo(models.User, {
      foreignKey: 'user_id',
      onDelete: 'SET NULL',
    });

    Conversation.hasMany(models.Message, {
      foreignKey: 'conversation_id',
      onDelete: 'CASCADE',
    });
  };

  return Conversation;
};
