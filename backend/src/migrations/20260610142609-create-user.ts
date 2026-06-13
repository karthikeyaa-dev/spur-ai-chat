'use strict';

import { QueryInterface, DataTypes, Sequelize } from 'sequelize';

export async function up(queryInterface: QueryInterface, Sequelize: typeof DataTypes): Promise<void> {
  await queryInterface.createTable('users', {
    id: {
      type: Sequelize.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
    },
    email: {
      type: Sequelize.STRING(255),
      allowNull: false,
      unique: true,
    },
    password: {
      type: Sequelize.STRING(512),
      allowNull: false,
    },
    role: {
      type: Sequelize.ENUM('user', 'admin'),
      allowNull: false,
      defaultValue: 'user',
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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

  // Add indexes
  await queryInterface.addIndex('users', ['email'], {
    name: 'idx_users_email',
    unique: true,
  });
  
  await queryInterface.addIndex('users', ['role'], {
    name: 'idx_users_role',
  });
  
  await queryInterface.addIndex('users', ['is_active'], {
    name: 'idx_users_is_active',
  });
  
  await queryInterface.addIndex('users', ['created_at'], {
    name: 'idx_users_created_at',
  });
}

export async function down(queryInterface: QueryInterface, Sequelize: typeof DataTypes): Promise<void> {
  // Remove indexes
  await queryInterface.removeIndex('users', 'idx_users_email');
  await queryInterface.removeIndex('users', 'idx_users_role');
  await queryInterface.removeIndex('users', 'idx_users_is_active');
  await queryInterface.removeIndex('users', 'idx_users_created_at');
  
  // Drop ENUM type for PostgreSQL
  if (queryInterface.sequelize.options.dialect === 'postgres') {
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role";');
  }
  
  // Drop table
  await queryInterface.dropTable('users');
}
