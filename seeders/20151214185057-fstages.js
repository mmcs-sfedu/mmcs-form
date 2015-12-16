'use strict';

var models = require('../models');

module.exports = {
  up: function (queryInterface, Sequelize) {

      return models.feedback_form.findAll().then(function(feedback_forms) {
          var feedback_stages = [];
          for (var j = 0; j < feedback_forms.length; j++) {
              var date = new Date();
              for (var i = 1; i <= 3; i++) {
                  var fromDate = new Date(date);
                  var toDate = new Date(date);
                  fromDate.setDate(date.getDate() + i * 5 - 5);
                  toDate.setDate(date.getDate() + i * 5);
                  feedback_stages.push({
                      date_from: fromDate.toISOString(),
                      date_to: toDate.toISOString(),
                      feedback_form_id: feedback_forms[j].id,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString()
                  });
              }
          }

          return queryInterface.bulkInsert('feedback_stages', feedback_stages, {});
      });

  },

  down: function (queryInterface, Sequelize) {

      return queryInterface.bulkDelete('feedback_stages', null, {});

  }
};
