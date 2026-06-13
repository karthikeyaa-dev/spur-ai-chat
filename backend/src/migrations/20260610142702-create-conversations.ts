'use strict';

import { QueryInterface, DataTypes } from 'sequelize';
import { uuidv7 } from 'uuidv7';

export async function up(queryInterface: QueryInterface, Sequelize: typeof DataTypes): Promise<void> {
  await queryInterface.createTable('messages', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: () => uuidv7(),
    },
    conversation_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'conversations',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    role: {
      type: Sequelize.ENUM('user', 'assistant'),
      allowNull: false,
    },
    content: {
      type: Sequelize.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
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

  // Add foreign key constraint
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
  
  // Add index for role if you frequently filter by it
  await queryInterface.addIndex('messages', ['role'], {
    name: 'idx_messages_role',
  });
  
  // Add composite index for conversation_id and role
  await queryInterface.addIndex('messages', ['conversation_id', 'role'], {
    name: 'idx_messages_conversation_role',
  });
}

export async function down(queryInterface: QueryInterface, Sequelize: typeof DataTypes): Promise<void> {
  // Remove foreign key constraint
  await queryInterface.removeConstraint('messages', 'fk_messages_conversation_id');
  
  // Remove indexes
  await queryInterface.removeIndex('messages', 'idx_messages_conversation_id');
  await queryInterface.removeIndex('messages', 'idx_messages_created_at');
  await queryInterface.removeIndex('messages', 'idx_messages_conversation_created');
  await queryInterface.removeIndex('messages', 'idx_messages_role');
  await queryInterface.removeIndex('messages', 'idx_messages_conversation_role');
  
  // Drop ENUM type for PostgreSQL
  if (queryInterface.sequelize.options.dialect === 'postgres') {
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_messages_role";');
  }
  
  // Drop table
  await queryInterface.dropTable('messages');
}
