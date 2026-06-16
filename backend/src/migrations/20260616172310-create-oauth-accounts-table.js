// migrations/XXXXXXXXXXXXXX-create-oauth-accounts-table.js

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create ENUM type for providers (PostgreSQL only)
    if (queryInterface.sequelize.options.dialect === 'postgres') {
      await queryInterface.sequelize.query(`
        DO $$ BEGIN
          CREATE TYPE "enum_oauth_accounts_provider" AS ENUM (
            'google',
            'github',
            'facebook',
            'apple',
            'microsoft'
          );
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);
    }

    // Create oauth_accounts table
    await queryInterface.createTable('oauth_accounts', {
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
      provider: {
        type: Sequelize.ENUM('google', 'github', 'facebook', 'apple', 'microsoft'),
        allowNull: false,
      },
      provider_user_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      provider_email: {
        type: Sequelize.STRING(255),
        allowNull: true,
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

    // Add unique constraints
    await queryInterface.addConstraint('oauth_accounts', {
      fields: ['user_id', 'provider'],
      type: 'unique',
      name: 'oauth_accounts_user_id_provider_unique',
    });

    await queryInterface.addConstraint('oauth_accounts', {
      fields: ['provider', 'provider_user_id'],
      type: 'unique',
      name: 'oauth_accounts_provider_user_id_unique',
    });

    // Add indexes
    await queryInterface.addIndex('oauth_accounts', ['user_id'], {
      name: 'oauth_accounts_user_id_idx',
    });

    await queryInterface.addIndex('oauth_accounts', ['provider', 'provider_user_id'], {
      name: 'oauth_accounts_provider_user_id_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop the table
    await queryInterface.dropTable('oauth_accounts');

    // Drop ENUM type (PostgreSQL only)
    if (queryInterface.sequelize.options.dialect === 'postgres') {
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_oauth_accounts_provider";');
    }
  },
};
