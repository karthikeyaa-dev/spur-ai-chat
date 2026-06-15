'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'email_verified_at', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
    });

    await queryInterface.addIndex('users', ['email_verified_at'], {
      name: 'idx_users_email_verified_at',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      'users',
      'idx_users_email_verified_at'
    );

    await queryInterface.removeColumn(
      'users',
      'email_verified_at'
    );
  },
};
