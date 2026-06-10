'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM('user', 'admin'),
        allowNull: false,
        defaultValue: 'user',
      },
      status: {
        type: Sequelize.ENUM('active', 'suspended'),
        allowNull: false,
        defaultValue: 'active',
      },
      email_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      last_login_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('users', ['email'], {
      name: 'idx_users_email',
      unique: true, 
    });
    
    await queryInterface.addIndex('users', ['role'], {
      name: 'idx_users_role',
    });
    
    await queryInterface.addIndex('users', ['status'], {
      name: 'idx_users_status',
    });
    
    await queryInterface.addIndex('users', ['email_verified'], {
      name: 'idx_users_email_verified',
    });
    
    await queryInterface.addIndex('users', ['last_login_at'], {
      name: 'idx_users_last_login_at',
    });
  },

  async down(queryInterface, Sequelize) {

    await queryInterface.removeIndex('users', 'idx_users_email');
    await queryInterface.removeIndex('users', 'idx_users_role');
    await queryInterface.removeIndex('users', 'idx_users_status');
    await queryInterface.removeIndex('users', 'idx_users_email_verified');
    await queryInterface.removeIndex('users', 'idx_users_last_login_at');
    
    if (queryInterface.sequelize.options.dialect === 'postgres') {
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role";');
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_status";');
    }
    
    await queryInterface.dropTable('users');
  },
};
