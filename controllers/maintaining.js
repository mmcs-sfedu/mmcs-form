/* Importing controllers */
var authController = require('../controllers/auth');

/* Importing db models helper */
var models = require('../models');

/* Public methods */
module.exports =
{
    authModule: authController,

    getExistingFormsData: getExistingFormsData,

    deleteForm: deleteForm
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

/**
 * Deletes form by ID.
 * @param {Number} id Form's ID.
 * @param {Function} callback Pass null to it to throw error and some JSON to signal about success.
 * */
function deleteForm(id, callback) {
    /* Looking for that form and it child stages. */
    return models.feedback_form.findOne({
        where: {id: id},
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        include: [
            {
                attributes: { exclude: ['createdAt', 'updatedAt'] },
                model: models.feedback_stage
            }
        ]})
        .then(function(feedback_form) {
            /* Destroying form only if it has no stages. */
            if (feedback_form != null && feedback_form['feedback_stages'].length == 0) {
                feedback_form.destroy(); // destroying found form and callback some json to success
                callback({ deleted_feedback_form_id: id });
            } else {
                callback(null);          // if form was not found returning null to throw error
            }
        }).catch(function() {             // returning null in callback to show error
                callback(null);
            });
}