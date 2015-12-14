'use strict';

var models = require('../models');

module.exports = {
  up: function (queryInterface, Sequelize) {

      return models.feedback_form.findAll().then(function(feedback_forms) {
          var questions = [];
          for (var j = 0; j < feedback_forms.length; j++) {
              for (var i = 1; i <= 5; i++) {
                  questions.push({
                      text: "Вопрос " + feedback_forms[j].id + "-" + i,
                      feedback_form_id: feedback_forms[j].id,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString()
                  });
              }
          }

          return queryInterface.bulkInsert('questions', questions, {});
      });

  },

  down: function (queryInterface, Sequelize) {

      return queryInterface.bulkDelete('questions', null, {});

  }
};
