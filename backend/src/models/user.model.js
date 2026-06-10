const { uuidv7 } = require('uuidv7');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: () => uuidv7(),
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },

      password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      role: {
        type: DataTypes.ENUM('user', 'admin'),
        allowNull: false,
        defaultValue: 'user',
      },

      status: {
        type: DataTypes.ENUM('active', 'suspended'),
        allowNull: false,
        defaultValue: 'active',
      },

      email_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      last_login_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'users',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  User.associate = (models) => {
    User.hasMany(models.Conversation, {
      foreignKey: 'user_id',
      onDelete: 'SET NULL',
    });
  };

  return User;
};
