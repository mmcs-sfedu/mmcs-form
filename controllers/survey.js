/* Importing controllers. */
var authController    = require('../controllers/auth');
var brsDataController = require('../controllers/brs');
var utilsController   = require('../controllers/utils');

/* To access DB. */
var models = require('../models');

/* Public methods. */
module.exports =
{
    // To provide an access to authorization for user.
    authModule : authController,

    getStageDescriptions : getStageDescriptions,

    getFormsQuestionsForStage : getFormsQuestionsForStage,

    saveUsersAnswer : saveUsersAnswer
};


/* Functions descriptions. */

/**
 * Returns all actual surveys for user in a callback.
 * @param {Object} req To provide a session for some functions.
 * @param {Function} callback A callback to return surveys.
 * */
function getStageDescriptions(req, callback) {
    /* Getting user's authorization (user's ID). */
    var authorizedUserId  = authController.getStudentsAuthorization(req.session);

    /* There is no need to load stages, if we are not going to show chooser for unauthorized user. */
    if (!authorizedUserId) {
        callback([]);
        return;
    }

    /* Getting group ID for authorized user. */
    var studentsGroupId = authController.getStudentsGroupId(req.session);

    /* Date border to choose only actual surveys. */
    var dateNow = new Date();

    /* Getting all possible stage descriptions. */
    models.stage_description.findAll({
        attributes: { exclude: ['createdAt', 'updatedAt'] }, // trash attributes
        include: [
            {
                // Including data about voted users.
                attributes: { exclude: ['createdAt', 'updatedAt'] },
                model: models.voted_user
            },
            {
                // Getting stage descriptions only for student's group.
                attributes: { exclude: ['createdAt', 'updatedAt'] },
                model: models.discipline,
                where: { group_id: [ studentsGroupId ] }
            },
            {
                // Getting only actual by date stage descriptions.
                attributes: { exclude: ['createdAt', 'updatedAt'] },
                model: models.feedback_stage,
                where: {
                    date_to:   { $gt: dateNow.toISOString() }, // actual for current date
                    date_from: { $lt: dateNow.toISOString() }
                }
            }
        ]
    }).then(function(result) {
        /* Parsing to normal JS object from Sequelize format. */
        var normalJsResult = utilsController.toNormalArray(result);


        /* TODO КОСТЫЛЬНАЯ ИНТЕГРАЦИЯ (ЗАГЛУШКА) ДЛЯ БРС! */
        var brsTeachers = brsDataController.getBrsTeachers(studentsGroupId);
        var brsSubjects = brsDataController.getBrsSubjects(studentsGroupId);


        /* Here will be response data with populated labels from BRS. */
        var desiredStageDescriptions = [];


        /* Iterating throw all stage descriptions to find ones, where current user didn't vote yet. */
        normalJsResult.forEach(function(sd) {
            // Boolean var to check if current user has already voted.
            var userVoted = sd['voted_users'].some(function(votedUser) {
                return votedUser['account_id'] === authorizedUserId;
            });
            // Only if user hasn't voted in that stage yet.
            if (!userVoted) {
                /* TODO ИСПРАВИТЬ ИНТЕГРАЦИЮ С ДАННЫМИ БРС! */
                brsTeachers.forEach(function(teacher) {
                    if (teacher['id'] == sd['discipline']['teacher_id']) {
                        sd['discipline']['teacher'] = teacher['name'];
                    }
                });
                brsSubjects.forEach(function(subject) {
                    if (subject['id'] == sd['discipline']['subject_id']) {
                        sd['discipline']['subject'] = subject['name'];
                    }
                });
                /* TODO КОНЕЦ ИНТЕГРАЦИИ */

                // Pushing checked and populated with BRS data object to response array.
                desiredStageDescriptions.push(sd);
            }
        });

        /* Returning prepared data about surveys. */
        callback(desiredStageDescriptions);
    });
}

/**
 * Returns found form in a callback. Form can be null, if something went wrong.
 * @param {Integer} stageDescriptionId ID of the stage to choose right form.
 * @param {Function} callback A callback which returns null or found form.
 * */
function getFormsQuestionsForStage(stageDescriptionId, callback) {
    /* Getting feedback form. */
    models.feedback_form.findAll({
        attributes: { exclude: ['createdAt', 'updatedAt'] }, // useless trash
        include: [
            {
                // Where stage description equals stated in source param.
                attributes: { exclude: ['createdAt', 'updatedAt'] },
                model: models.feedback_stage,
                include: [
                    {
                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                        model: models.stage_description,
                        where: { id: stageDescriptionId }
                    }
                ]
            },
            {
                // Getting also question for that form.
                attributes: { exclude: ['createdAt', 'updatedAt'] },
                model: models.question,
                include: [
                    {
                        // And answers for question.
                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                        model: models.possible_answer
                    }
                ]
            }
        ]
    }).then(function(forms) {
        /* Returning found form to student. */
        callback(utilsController.toNormalArray(forms)[0]);
    });
}

/**
 * Saves user's answer for survey.
 * @param {Object} req To provide a session for some functions.
 * @param {Integer} stageDescriptionId Survey ID.
 * @param {Array} usersAnswers User's answers for that survey.
 * @param {Object} res To draw response page.
 */
function saveUsersAnswer(req, stageDescriptionId, usersAnswers, res) {
    /* Using same format to get possible answers (user's answers) IDs. */
    usersAnswers = JSON.parse('[' + usersAnswers + ']');

    /* Preparing array for bulk insert. */
    var answers = [];
    for (var i = 0; i < usersAnswers.length; i++) {
        answers.push({
            possible_answer_id: usersAnswers[i],
            stage_description_id: stageDescriptionId,
            createdAt: new Date(),
            updatedAt: new Date()
        });
    }

    /* Transaction to insert both voted user and his answers data. */
    return models.sequelize.transaction(
        { autocommit: false },   // without false param returns an error
        function (t) {
            return models.voted_user
                .create({           // creating voted user record
                    stage_description_id: stageDescriptionId,
                    account_id: authController.getStudentsAuthorization(req.session),
                    createdAt: new Date(),
                    updatedAt: new Date()
                }, { transaction: t })
                .then(function () { // when voted user data inserted, adding his answers
                    return models.answer.bulkCreate(answers, { transaction: t });
                });
        }).then(function (result) { // when transaction successfully completed - rendering ok page
            res.render('pages/survey/finish');
        }).catch(function (err) {   // when an error occurred with transaction - rendering error page
            res.render('error', {
                message: "Произошла ошибка в транзакции записи результата голосования!",
                error: {}
            });
        });
}