'use strict';

var models = require('../models');

module.exports = {
  up: function (queryInterface, Sequelize) {

      return models.question.findAll().then(function(questions) {
          var possible_answers = [];
          for (var j = 0; j < questions.length; j++) {
              for (var i = 1; i <= 5; i++) {
                  possible_answers.push({
                      text: "Possible answers " + questions[j].id + "-" + i,
                      question_id: questions[j].id,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString()
                  });
              }
          }

          return queryInterface.bulkInsert('possible_answers', possible_answers, {});
      });

  },

  down: function (queryInterface, Sequelize) {

      return queryInterface.bulkDelete('possible_answers', null, {});

  }
};
