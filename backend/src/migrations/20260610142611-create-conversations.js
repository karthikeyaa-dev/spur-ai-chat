'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('conversations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      session_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('active', 'closed'),
        allowNull: false,
        defaultValue: 'active',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addConstraint('conversations', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_conversations_user_id',
      references: {
        table: 'users',
        field: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addIndex('conversations', ['session_id'], {
      name: 'idx_conversations_session_id',
    });
    await queryInterface.addIndex('conversations', ['user_id'], {
      name: 'idx_conversations_user_id',
    });
    await queryInterface.addIndex('conversations', ['status'], {
      name: 'idx_conversations_status',
    });
    await queryInterface.addIndex('conversations', ['created_at'], {
      name: 'idx_conversations_created_at',
    });
  },

  async down(queryInterface, Sequelize) {

    try {
      await queryInterface.removeConstraint('conversations', 'fk_conversations_user_id');
    } catch (e) {
    }
    
    await queryInterface.removeIndex('conversations', 'idx_conversations_session_id');
    await queryInterface.removeIndex('conversations', 'idx_conversations_user_id');
    await queryInterface.removeIndex('conversations', 'idx_conversations_status');
    await queryInterface.removeIndex('conversations', 'idx_conversations_created_at');
    
    await queryInterface.dropTable('conversations');
  },
};
