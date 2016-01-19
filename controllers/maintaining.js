/* Importing controllers */
var authController = require('../controllers/auth');
var brsDataController = require('../controllers/brs');

/* Importing db models helper */
var models = require('../models');

/* Public methods */
module.exports =
{
    authModule: authController,

    getExistingFormsData: getExistingFormsData,

    getAllStagesData: getAllStagesData,

    deleteForm: deleteForm,

    addForm: addForm,

    deleteStage: deleteStage
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
 * Provides a data to draw a list of existing stages (to delete them) with short info.
 * @param {Object} res In a case of error res will be used to instantly render error page.
 * @param {Function} callback Used to asynchronously return data.
 * */
function getAllStagesData(res, callback) {
    /* Getting all feedback stages. */
    models.feedback_stage.findAll({
        attributes: { exclude: ['createdAt', 'updatedAt'] }, // sour data
        order: 'date_to DESC', // last proceeded stage will be at the top
        include: [
            {   // Including form name for that stage.
                attributes: ['name'],
                model: models.feedback_form
            },
            {   // To get an information about disciplines next.
                attributes: ['id', 'discipline_id'],
                model: models.stage_description,
                include: { // To get an information about discipline, it's teacher and group from BRS
                    attributes: { exclude: ['createdAt', 'updatedAt'] },
                    model: models.discipline
                }
            }]
        // Fetching result here.
    }).then(function(result) {
        // If something went wrong return empty array.
        if (result == null) {
            callback([]);
            return;
        }

        /* To convert this value to usual object and make it client-side-readable. */
        result = result.map(function(stage){ return stage.toJSON() });

        /* Getting data about discipline from BRS. */
        var brsGroups   = brsDataController.getBrsGroups();
        var brsTeachers = brsDataController.getBrsTeachers(null);
        var brsSubjects = brsDataController.getBrsSubjects(null);

        /* Checking BRS data. */
        if (brsGroups == null)   { renderError('Не удалось загрузить список групп от БРС'); return; }
        if (brsTeachers == null) { renderError('Не удалось загрузить список преподавателей от БРС'); return; }
        if (brsSubjects == null) { renderError('Не удалось загрузить список предметов от БРС'); return; }

        /* Renders error with description. */
        function renderError(description) {
            res.render('error', {
                message: description,
                error: {}
            });
        }

        /* We'll use that template if BRS data is not specified. */
        var noDataTemplate = 'Нет данных';

        
        /* Scary merge with BRS data. Don't forget to change BRS data structure when it'll work with true BRS! */
        for (var stageIndex in result) {
            var stageDescriptions = result[stageIndex]['stage_descriptions'];
            for (var stageDescriptionIndex in stageDescriptions) {
                var stageDescription = stageDescriptions[stageDescriptionIndex];
                var discipline = stageDescription['discipline'];

                // To use template text if not found in BRS.
                var brsItemFound = false;
                
                // Looking for groups intersections.
                for (var groupIndex in brsGroups) {
                    var group = brsGroups[groupIndex];
                    if (discipline['group_id'] == group['id']) {
                        discipline['group'] = group['name'];
                        brsItemFound = true;
                        break;
                    }
                }
                // Setting template if not found in BRS.
                if (!brsItemFound) {
                    discipline['group'] = noDataTemplate;
                }
                
                brsItemFound = false;

                // Looking for teachers intersections.
                for (var teacherIndex in brsTeachers) {
                    var teacher = brsTeachers[teacherIndex];
                    if (discipline['teacher_id'] == teacher['id']) {
                        discipline['teacher'] = teacher['name'];
                        brsItemFound = true;
                        break;
                    }
                }
                // Setting template if not found in BRS.
                if (!brsItemFound) {
                    discipline['teacher'] = noDataTemplate;
                }

                brsItemFound = false;

                // Looking for subjects intersections.
                for (var subjectIndex in brsSubjects) {
                    var subject = brsSubjects[subjectIndex];
                    if (discipline['subject_id'] == subject['id']) {
                        discipline['subject'] = subject['name'];
                        brsItemFound = true;
                        break;
                    }
                }
                // Setting template if not found in BRS.
                if (!brsItemFound) {
                    discipline['subject'] = noDataTemplate;
                }
            }
        }

        callback(result);
    })
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
 * Deletes stage by ID.
 * @param {Number} id Stage's ID.
 * @param {Function} callback Pass null to it to throw error and some JSON to signal about success.
 * */
function deleteStage(id, callback) {
    /* Looking for that form and it child stages. */
    return models.feedback_stage.findOne({
        where: { id: id },
        attributes: { exclude: ['createdAt', 'updatedAt'] }
    }).then(function(feedback_stage) {
            /* Destroying stage. */
            if (feedback_stage != null) {
                feedback_stage.destroy(); // destroying found stage and callback some json to success
                callback({ deleted_feedback_stage_id: id });
            } else {
                callback(null);           // if stage was not found returning null to throw error
            }
        }).catch(function() {             // returning null in callback to show error
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