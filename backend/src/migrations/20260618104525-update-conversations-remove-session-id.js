'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.removeColumn('conversations', 'session_id');

    await queryInterface.changeColumn('conversations', 'user_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    });

    await queryInterface.addColumn('conversations', 'title', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addIndex('conversations', ['user_id', 'status'], {
      name: 'conversations_user_id_status_idx',
    });
  },

  async down(queryInterface, Sequelize) {

    await queryInterface.removeIndex('conversations', 'conversations_user_id_status_idx');

    await queryInterface.removeColumn('conversations', 'title');

    await queryInterface.changeColumn('conversations', 'user_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    });

    await queryInterface.addColumn('conversations', 'session_id', {
      type: Sequelize.UUID,
      allowNull: false,
    });
  },
};
