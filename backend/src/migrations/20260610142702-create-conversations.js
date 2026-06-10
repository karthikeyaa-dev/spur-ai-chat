'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('messages', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
      },
      conversation_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM('user', 'assistant'),
        allowNull: false,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
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

    await queryInterface.addConstraint('messages', {
      fields: ['conversation_id'],
      type: 'foreign key',
      name: 'fk_messages_conversation_id',
      references: {
        table: 'conversations',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addIndex('messages', ['conversation_id'], {
      name: 'idx_messages_conversation_id'
    });
    await queryInterface.addIndex('messages', ['created_at'], {
      name: 'idx_messages_created_at'
    });
    await queryInterface.addIndex('messages', ['conversation_id', 'created_at'], {
      name: 'idx_messages_conversation_created'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('messages', 'fk_messages_conversation_id');
    
    await queryInterface.removeIndex('messages', 'idx_messages_conversation_id');
    await queryInterface.removeIndex('messages', 'idx_messages_created_at');
    await queryInterface.removeIndex('messages', 'idx_messages_conversation_created');
    
    if (queryInterface.sequelize.options.dialect === 'postgres') {
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_messages_role";');
    }
    
    await queryInterface.dropTable('messages');
  },
};
