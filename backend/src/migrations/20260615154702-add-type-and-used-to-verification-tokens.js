'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.addColumn('verification_tokens', 'type', {
      type: Sequelize.ENUM('email_verification', 'password_reset'),
      allowNull: false,
      defaultValue: 'email_verification',
    });

    await queryInterface.addColumn('verification_tokens', 'used', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface, Sequelize) {

    await queryInterface.removeColumn('verification_tokens', 'used');

    await queryInterface.removeColumn('verification_tokens', 'type');

    if (queryInterface.sequelize.options.dialect === 'postgres') {
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_verification_tokens_type";');
    }
  },
};
