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

    var createdFormID = null;
    models.sequelize.transaction(
        {autocommit: false},
        function(t) {
            return models.feedback_form.create({
                name: name,
                createdAt: new Date(),
                updatedAt: new Date()
            }, {transaction: t})
                .then(function(feedback_form) {
                    createdFormID = feedback_form.id;
                    for (var questionID in questions) {
                        var question = questions[questionID];
                        if (question['text'] == null || question['answers'] == null || question['answers'].length == 0) {
                            throw new Error();
                        }
                    }

                    var rightQuestionsToInsert = [];
                    for (var questionID in questions) {
                        var question = questions[questionID];
                        rightQuestionsToInsert.push({
                            feedback_form_id: createdFormID,
                            text: question['text'],
                            createdAt: new Date(),
                            updatedAt: new Date()
                        });
                    }

                    return models.question.bulkCreate(rightQuestionsToInsert, {transaction: t, returning: true})
                        .then(function(insertedQuestions) {

                            var rightAnswers = [];
                            var i = -1;
                                    for (var questionID in questions) {
                                        var oldQuestion = questions[questionID];
                                        i++;
                                        for (var possibleAnswer in oldQuestion['answers']) {
                                            rightAnswers.push({
                                                question_id: insertedQuestions[i].id,
                                                text: oldQuestion['answers'][possibleAnswer],
                                                createdAt: new Date(),
                                                updatedAt: new Date()
                                            });
                                        }
                                    }

                            return models.possible_answer.bulkCreate(rightAnswers, {transaction: t, returning: true});
                        })
                });
        }
    ).then(function(result) {
            var escape = require('escape-html');
            callback({id:createdFormID, name: escape(name), stages:0});
    }).catch(function(err) {
            callback(null)
    });
}