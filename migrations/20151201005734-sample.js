/** This migration was created with the next command:
 *
 * node_modules/.bin/sequelize migration:create --name sample
 *
 * This is a sample migration. TODO: удалить потом */

'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */

      queryInterface.createTable(
          'Samples',
          {
              id: {
                  type: Sequelize.INTEGER,
                  primaryKey: true,
                  autoIncrement: true
              },
              createdAt: {
                  type: Sequelize.DATE
              },
              updatedAt: {
                  type: Sequelize.DATE
              },
              attr1: Sequelize.STRING,
              attr2: Sequelize.INTEGER,
              attr3: {
                  type: Sequelize.BOOLEAN,
                  defaultValue: false,
                  allowNull: false
              }
          },
          {
              // engine: 'MYISAM', // default: 'InnoDB'
              charset: 'utf8' // 'latin1' // default: null
          }
      )

  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */

      return queryInterface.dropTable('Samples');

      // return queryInterface.dropAllTables();

  }
};
