'use strict';

var models = require('../models');

module.exports = {
  up: function (queryInterface, Sequelize) {

      return models.feedback_stage.findAll().then(function(feedback_stages) {
          models.discipline.findAll().then(function(disciplines) {
              var stage_descriptions = [];

              for (var i = 0; i < feedback_stages.length; i++) {
                  for (var j = 0; j < disciplines.length; j++) {
                      stage_descriptions.push({
                          discipline_id: disciplines[j].id,
                          feedback_stage_id: feedback_stages[i].id,
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString()
                      });
                  }
              }

              return queryInterface.bulkInsert('stage_descriptions', stage_descriptions, {});
          });
      });

  },

  down: function (queryInterface, Sequelize) {

      return queryInterface.bulkDelete('stage_descriptions', null, {});

  }
};
