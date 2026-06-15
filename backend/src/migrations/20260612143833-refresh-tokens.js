'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('refresh_tokens', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      jti: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
      },
      session_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      parent_jti: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      child_jti: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      revoked: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      revoked_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      used_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('active', 'used', 'revoked'),
        allowNull: false,
        defaultValue: 'active',
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true,
      },
      device_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      user_agent: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
    });

    await queryInterface.addIndex('refresh_tokens', ['user_id'], {
      name: 'idx_refresh_tokens_user_id',
    });
    await queryInterface.addIndex('refresh_tokens', ['jti'], {
      name: 'idx_refresh_tokens_jti',
      unique: true,
    });
    await queryInterface.addIndex('refresh_tokens', ['session_id'], {
      name: 'idx_refresh_tokens_session_id',
    });
    await queryInterface.addIndex('refresh_tokens', ['status'], {
      name: 'idx_refresh_tokens_status',
    });
    await queryInterface.addIndex('refresh_tokens', ['expires_at'], {
      name: 'idx_refresh_tokens_expires_at',
    });
  },

  async down(queryInterface, Sequelize) {

    await queryInterface.removeIndex('refresh_tokens', 'idx_refresh_tokens_user_id');
    await queryInterface.removeIndex('refresh_tokens', 'idx_refresh_tokens_jti');
    await queryInterface.removeIndex('refresh_tokens', 'idx_refresh_tokens_session_id');
    await queryInterface.removeIndex('refresh_tokens', 'idx_refresh_tokens_status');
    await queryInterface.removeIndex('refresh_tokens', 'idx_refresh_tokens_expires_at');
    
    if (queryInterface.sequelize.options.dialect === 'postgres') {
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_refresh_tokens_status";');
    }
    
    await queryInterface.dropTable('refresh_tokens');
  },
};
