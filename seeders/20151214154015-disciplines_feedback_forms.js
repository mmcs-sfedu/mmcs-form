'use strict';

var models = require('../models');

module.exports = {
  up: function (queryInterface, Sequelize) {

      var count = 15;

      var subjects = [];
      for (var i = 1; i <= count; ++i) {
          subjects.push({
              name: "Предмет " + i,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
          })
      }
      var teachers = [];
      for (i = 1; i <= count; ++i) {
          teachers.push({
              name: "Преподаватель " + i,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
          })
      }
      var groups = [];
      for (i = 1; i <= count; ++i) {
          groups.push({
              name: "Группа " + i,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
          })
      }
      queryInterface.bulkInsert('subjects', subjects, {});
      queryInterface.bulkInsert('teachers', teachers, {});
      queryInterface.bulkInsert('groups', groups, {});

      var disciplines = [];
      for (i = 1; i <= count; i++) {
          disciplines.push({
              teacher_id: i,
              subject_id: i,
              group_id: i,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
          });
      }
      queryInterface.bulkInsert('disciplines', disciplines, {});

      var feedback_forms = [];
      for (i = 1; i <= 5; i++) {
          feedback_forms.push({
              name: "Форма анкетирования " + i,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
          });
      }
      return queryInterface.bulkInsert('feedback_forms', feedback_forms, {});

  },

  down: function (queryInterface, Sequelize) {

      queryInterface.bulkDelete('feedback_forms', null, {});
      queryInterface.bulkDelete('disciplines', null, {});
      queryInterface.bulkDelete('teachers', null, {});
      queryInterface.bulkDelete('groups', null, {});
      return queryInterface.bulkDelete('subjects', null, {});

  }
};
