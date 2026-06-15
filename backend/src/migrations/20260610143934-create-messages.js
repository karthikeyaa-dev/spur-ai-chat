'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('messages', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      conversation_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'conversations',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
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

    await queryInterface.addIndex('messages', ['conversation_id'], {
      name: 'idx_messages_conversation_id',
    });
    
    await queryInterface.addIndex('messages', ['created_at'], {
      name: 'idx_messages_created_at',
    });
    
    await queryInterface.addIndex('messages', ['conversation_id', 'created_at'], {
      name: 'idx_messages_conversation_created',
    });
    
    await queryInterface.addIndex('messages', ['role'], {
      name: 'idx_messages_role',
    });
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeConstraint('messages', 'messages_conversation_id_fkey');
    } catch (error) {
      try {
        await queryInterface.removeConstraint('messages', 'messages_conversation_id_foreign_idx');
      } catch (error2) {
        console.log('Constraint not found, continuing...');
      }
    }
    
    try {
      await queryInterface.removeIndex('messages', 'idx_messages_conversation_id');
    } catch (error) {
      console.log('Index idx_messages_conversation_id not found');
    }
    
    try {
      await queryInterface.removeIndex('messages', 'idx_messages_created_at');
    } catch (error) {
      console.log('Index idx_messages_created_at not found');
    }
    
    try {
      await queryInterface.removeIndex('messages', 'idx_messages_conversation_created');
    } catch (error) {
      console.log('Index idx_messages_conversation_created not found');
    }
    
    try {
      await queryInterface.removeIndex('messages', 'idx_messages_role');
    } catch (error) {
      console.log('Index idx_messages_role not found');
    }
    
    if (queryInterface.sequelize.options.dialect === 'postgres') {
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_messages_role";');
    }
    
    await queryInterface.dropTable('messages');
  },
};
