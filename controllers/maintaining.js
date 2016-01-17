/* Importing controllers */
var authController = require('../controllers/auth');

/* Importing db models helper */
var models = require('../models');

/* Public methods */
module.exports =
{
    authModule: authController,

    getExistingFormsData: getExistingFormsData
};

/**
 * Provides data to draw list of existing forms (to delete them) with short info.
 * */
function getExistingFormsData() {
    models.feedback_form.findAll()
        .then(function(result) {
            return result;
    })
}