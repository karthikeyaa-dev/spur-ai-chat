'use strict';

import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface, Sequelize: typeof DataTypes): Promise<void> {
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

  // Add indexes
  await queryInterface.addIndex('messages', ['conversation_id'], {
    name: 'idx_messages_conversation_id',
  });
  
  await queryInterface.addIndex('messages', ['created_at'], {
    name: 'idx_messages_created_at',
  });
  
  await queryInterface.addIndex('messages', ['conversation_id', 'created_at'], {
    name: 'idx_messages_conversation_created',
  });
  
  // Optional: Add index for role if needed for filtering
  await queryInterface.addIndex('messages', ['role'], {
    name: 'idx_messages_role',
  });
}

export async function down(queryInterface: QueryInterface, Sequelize: typeof DataTypes): Promise<void> {
  // Remove the foreign key constraint from messages table (if it exists)
  try {
    await queryInterface.removeConstraint('messages', 'messages_conversation_id_fkey');
  } catch (error) {
    // Constraint might not exist with this name, try alternative
    try {
      await queryInterface.removeConstraint('messages', 'messages_conversation_id_foreign_idx');
    } catch (error2) {
      console.log('Constraint not found, continuing...');
    }
  }
  
  // Drop ENUM type for PostgreSQL
  if (queryInterface.sequelize.options.dialect === 'postgres') {
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_messages_role";');
  }
  
  // Drop the table
  await queryInterface.dropTable('messages');
}
