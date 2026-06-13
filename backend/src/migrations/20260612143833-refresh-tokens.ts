'use strict';

import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface, Sequelize: typeof DataTypes): Promise<void> {
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
      references: {
        model: 'refresh_tokens',
        key: 'jti',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    child_jti: {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'refresh_tokens',
        key: 'jti',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
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

  // Add indexes
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
  
  await queryInterface.addIndex('refresh_tokens', ['revoked'], {
    name: 'idx_refresh_tokens_revoked',
  });
  
  await queryInterface.addIndex('refresh_tokens', ['device_id'], {
    name: 'idx_refresh_tokens_device_id',
  });
  
  await queryInterface.addIndex('refresh_tokens', ['expires_at'], {
    name: 'idx_refresh_tokens_expires_at',
  });
  
  await queryInterface.addIndex('refresh_tokens', ['status'], {
    name: 'idx_refresh_tokens_status',
  });
  
  // Composite indexes for common queries
  await queryInterface.addIndex('refresh_tokens', ['user_id', 'status'], {
    name: 'idx_refresh_tokens_user_status',
  });
  
  await queryInterface.addIndex('refresh_tokens', ['user_id', 'device_id'], {
    name: 'idx_refresh_tokens_user_device',
  });
  
  await queryInterface.addIndex('refresh_tokens', ['status', 'expires_at'], {
    name: 'idx_refresh_tokens_status_expires',
  });
}

export async function down(queryInterface: QueryInterface, Sequelize: typeof DataTypes): Promise<void> {
  // Remove all indexes
  const indexes = [
    'idx_refresh_tokens_user_id',
    'idx_refresh_tokens_jti',
    'idx_refresh_tokens_session_id',
    'idx_refresh_tokens_revoked',
    'idx_refresh_tokens_device_id',
    'idx_refresh_tokens_expires_at',
    'idx_refresh_tokens_status',
    'idx_refresh_tokens_user_status',
    'idx_refresh_tokens_user_device',
    'idx_refresh_tokens_status_expires',
  ];

  for (const indexName of indexes) {
    try {
      await queryInterface.removeIndex('refresh_tokens', indexName);
    } catch (error) {
      console.log(`Index ${indexName} not found, continuing...`);
    }
  }
  
  // Drop ENUM type for PostgreSQL
  if (queryInterface.sequelize.options.dialect === 'postgres') {
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_refresh_tokens_status";');
  }
  
  // Drop the table
  await queryInterface.dropTable('refresh_tokens');
}
