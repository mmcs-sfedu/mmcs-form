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
 * @param {Function} callback Used to asynchronously return data.
 * */
function getExistingFormsData(callback) {
    models.feedback_form.findAll({
        attributes: { exclude: ['createdAt', 'updatedAt'] }, // we don't like data with dates
        include: {
            attributes: ['id'],
            model: models.feedback_stage
        }
    }).then(function(result) {
            if (result == null) {
                callback([]);
                return;
            }

            /* To convert this value to usual object and make it client-side-readable. */
            result = result.map(function(form){ return form.toJSON() });

            callback(result);
        }
    );
}