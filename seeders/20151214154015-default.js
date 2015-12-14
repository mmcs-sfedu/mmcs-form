'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

      var disciplines = [];
      for (var i = 1; i <= 5; i++) {
          disciplines.push({
              teacher_id: i,
              subject_id: i,
              group_id: i,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
          });
      }

      var feedback_forms = [];
      for (i = 1; i <= 5; i++) {
          feedback_forms.push({
              name: "Форма анкетирования " + i,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
          });
      }

      queryInterface.bulkInsert('disciplines', disciplines, {});
      return queryInterface.bulkInsert('feedback_forms', feedback_forms, {});

  },

  down: function (queryInterface, Sequelize) {

      queryInterface.bulkDelete('feedback_forms', null, {});
      return queryInterface.bulkDelete('disciplines', null, {});

  }
};
