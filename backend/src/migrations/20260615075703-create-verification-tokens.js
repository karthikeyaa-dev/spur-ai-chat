'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('verification_tokens', {
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

      token_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },

      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      used_at: {
        type: Sequelize.DATE,
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

    await queryInterface.addIndex(
      'verification_tokens',
      ['user_id'],
      {
        name: 'idx_verification_tokens_user_id',
      }
    );

    await queryInterface.addIndex(
      'verification_tokens',
      ['token_hash'],
      {
        name: 'idx_verification_tokens_token_hash',
        unique: true,
      }
    );

    await queryInterface.addIndex(
      'verification_tokens',
      ['expires_at'],
      {
        name: 'idx_verification_tokens_expires_at',
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      'verification_tokens',
      'idx_verification_tokens_user_id'
    );

    await queryInterface.removeIndex(
      'verification_tokens',
      'idx_verification_tokens_token_hash'
    );

    await queryInterface.removeIndex(
      'verification_tokens',
      'idx_verification_tokens_expires_at'
    );

    await queryInterface.dropTable('verification_tokens');
  },
};
