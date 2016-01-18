/* Importing controllers */
var authController = require('../controllers/auth');

/* Importing db models helper */
var models = require('../models');

/* Public methods */
module.exports =
{
    authModule: authController,

    getExistingFormsData: getExistingFormsData,

    deleteForm: deleteForm,

    addForm: addForm
};



/**
 * Provides data to draw list of existing forms (to delete them) with short info.
 * @param {Function} callback Used to asynchronously return data.
 * */
function getExistingFormsData(callback) {
    models.feedback_form.findAll({
        attributes: { exclude: ['createdAt', 'updatedAt'] }, // we don't like data with dates
        order: 'id',
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
        }).catch(function() {            // returning null in callback to show error
                callback(null);
            });
}

/**
 * Adds form with its questions and answers.
 * @param {Array} body Contents of future form.
 * @param {Function} callback Pass null to it to throw error and return created form as json to signal about success.
 * */
function addForm(body, callback) {
    /* Checking request body name. */
    var name = body['name'];
    if (name == null) {
        callback(null);
        return;
    }

    /* Checking request body questions array. */
    var questions = body['questions'];
    if (questions == null || Object.keys(questions).length == 0) {
        callback(null);
        return;
    }

    /* That var will contain created form ID. */
    var createdFormID = null;

    /* Beginning transaction (because it's impossible to add a form without questions and answers). */
    models.sequelize.transaction(
        { autocommit: false }, // transactions don't work without that param
        function(t) {
            // Creating feedback form first.
            return models.feedback_form.create({
                name: name,
                createdAt: new Date(),
                updatedAt: new Date()
            }, { transaction: t }) // in the same transaction
                .then(function(feedback_form) {
                    // Saving created form ID.
                    createdFormID = feedback_form.id;

                    /* Preparing data to insert. */
                    var checkedQuestionsToInsert = [];

                    // Walking throw passed by user questions to check that they has all necessary data.
                    for (var questionID in questions) {
                        // Current question.
                        var question = questions[questionID];
                        // Question must have it's text, and some answers.
                        if (question['text'] == null || question['answers'] == null || question['answers'].length == 0) {
                            throw new Error(); // that error will rollback transaction, if some data corrupted
                        }

                        // If data is valid, inserting it in prepared array.
                        checkedQuestionsToInsert.push({
                            feedback_form_id: createdFormID,
                            text: question['text'],
                            createdAt: new Date(),
                            updatedAt: new Date()
                        });
                    }

                    /* Inserting prepared questions in database. */
                    return models.question
                        .bulkCreate(checkedQuestionsToInsert, {
                            transaction: t,    // using same transaction
                            returning: true }) // must specify returning param to make ORM return created elements' ids
                        .then(function(insertedQuestions) {

                            /* Questions are inserted, now preparing answers for them. */
                            var checkedAnswersToInsert = [];
                            // To iterate synchronously with inserted questions (to get their IDs).
                            var iqPointer = -1;

                            // We should differentiate questions (passed by user) and insertedQuestions (which already has IDs).
                            for (var questionID in questions) {
                                var usersPassedQuestion = questions[questionID];
                                iqPointer++; // increasing pointer synchronously with user's questions

                                /* Preparing answers for current question (answers located only in raw source questions). */
                                for (var possibleAnswer in usersPassedQuestion['answers']) {
                                    checkedAnswersToInsert.push({
                                        question_id: insertedQuestions[iqPointer].id,
                                        text: usersPassedQuestion['answers'][possibleAnswer],
                                        createdAt: new Date(),
                                        updatedAt: new Date()
                                    });
                                }
                            }

                            /* And making multiple insert with the same params. */
                            return models.possible_answer.bulkCreate(checkedAnswersToInsert, { transaction: t, returning: true });
                        })
                });

            /* Here we are approaching two possible results of our big transaction. */
        }).then(function(result) { // if everything is ok
            /* Must escape to protect from XSS. */
            var escape = require('escape-html'); // importing module for that
            callback({ id: createdFormID, name: escape(name), stages: 0}); // obviously we don't have feedback stages yet
        }).catch(function(error) { // if something went wrong or source data was invalid
            callback(null)
        });
}