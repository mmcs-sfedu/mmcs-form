'use strict';

var models = require('../models');

module.exports = {
  up: function (queryInterface, Sequelize) {

      /* We have to wait to fire that seed successfully first time. */
      sleepFor(500);

      return models.stage_description.findAll().then(function(stage_descriptions) {
          var voted_users = [];
          for (var j = 0; j < stage_descriptions.length; j++) {
              for (var i = 1; i <= 3; i++) {
                  voted_users.push({
                      account_id: '' + i,
                      stage_description_id: stage_descriptions[j].id,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString()
                  });
              }
          }

          return queryInterface.bulkInsert('voted_users', voted_users, {});
      });

  },

  down: function (queryInterface, Sequelize) {

      return queryInterface.bulkDelete('voted_users', null, {});

  }
};

/* Freezes main process for stated time. */
function sleepFor(msecs) {
    var now = new Date().getTime();
    while (new Date().getTime() < now + msecs) { }
}
