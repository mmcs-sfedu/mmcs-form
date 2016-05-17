/* Importing controllers. */
var authController    = require('../controllers/auth');
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

    checkStageAvailabilityForUser : checkStageAvailabilityForUser,

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

    /* Getting group ID for authorized user. Now we're not binding user to his group! */
    // var studentsGroupId = authController.getStudentsGroupId(req.session);

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
                include: [
                    {
                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                        model: models.subject
                    },
                    {
                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                        model: models.teacher
                    },
                    {
                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                        model: models.group
                    }
                ]
                //where: { group_id: [ studentsGroupId ] }
            },
            {
                // Getting only actual by date stage descriptions.
                attributes: { exclude: ['createdAt', 'updatedAt'] },
                model: models.feedback_stage,
                where: {
                    date_to:   { $gt: dateNow.toISOString() }, // actual for current date
                    date_from: { $lt: dateNow.toISOString() }
                },
                // We also want to get form's name
                include:
                {
                    attributes: ['name'],
                    model: models.feedback_form
                }
            }
        ]
    }).then(function(result) {
        /* Parsing to normal JS object from Sequelize format. */
        var normalJsResult = utilsController.toNormalArray(result);


        /* Here will be response data with populated labels from BRS. */
        var desiredStageDescriptions = [];


        /* Iterating throw all stage descriptions to find ones, where current user didn't vote yet. */
        normalJsResult.forEach(function(sd) {
            // Boolean var to check if current user has already voted.
            var userVoted = sd['voted_users'].some(function(votedUser) {
                return votedUser['account_id'].valueOf() == authorizedUserId.valueOf();
            });
            // Only if user hasn't voted in that stage yet.
            if (!userVoted) {
                // We don't want to send voted users data to client.
                delete sd['voted_users'];

                // Pushing checked and populated with BRS data object to response array.
                desiredStageDescriptions.push(sd);
            }
        });

        // console.log(desiredStageDescriptions);

        /* Returning prepared data about surveys. */
        callback(desiredStageDescriptions);
    });
}

/**
 * Returns found form in a callback. Form can be null, if something went wrong.
 * @param {Number} stageDescriptionId ID of the stage to choose right form.
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
                        where: { id: stageDescriptionId },
                        include: {
                            attributes: ['teacher_id', 'subject_id'],
                            model: models.discipline
                        }
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
        // Converting result to usual js object.
        var formJsObject = utilsController.toNormalArray(forms)[0];


        /* TODO КОСТЫЛЬНАЯ ИНТЕГРАЦИЯ (ЗАГЛУШКА) ДЛЯ БРС! */
        var brsTeachers = brsDataController.getBrsTeachers();
        var brsSubjects = brsDataController.getBrsSubjects();
        brsTeachers.forEach(function(teacher) {
            if (teacher['id'] == formJsObject.feedback_stages[0].stage_descriptions[0].discipline.teacher_id) {
                formJsObject['teacher'] = teacher['name'];
                return false;
            }
        });
        brsSubjects.forEach(function(subject) {
            if (subject['id'] == formJsObject.feedback_stages[0].stage_descriptions[0].discipline.subject_id) {
                formJsObject['subject'] = subject['name'];
                return false;
            }
        });


        /* Returning found form to student. */
        callback(formJsObject);
    });
}

/**
 * Checks if current student has already voted for provided stage or this stage is not available for him.
 * @param {Number} stageDescriptionId ID of the stage to check for authorized user.
 * @param {Object} session A session to get student's auth data.
 * @param {Function} callback To return a result of the check:
 *                            true - if user can vote for this stage description, false - in another case.
 * */
function checkStageAvailabilityForUser(stageDescriptionId, session, callback) {
    // Getting and checking student's group (deprecated) and ID first of all.
    // var studentsGroupID = authController.getStudentsGroupId(session);
    var studentID       = authController.getStudentsAuthorization(session);
    if (studentID) {
        // Looking for stage description with provided ID.
        models.stage_description.findOne({
            where: { id: stageDescriptionId },
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            include: [
                {
                    attributes: ['group_id'],
                    model: models.discipline
                },
                {
                    attributes: ['date_from', 'date_to'],
                    model: models.feedback_stage
                },
                {
                    attributes: ['account_id'],
                    model: models.voted_user
                }
            ]
        }).then(function(stage_description) {
            // It's impossible to vote for non-existing stage.
            if (stage_description == null) {
                callback(false);
                return;
            }

            // Checking if chosen stage is available for student's group. Deprecated.
            //if (stage_description.discipline.group_id != studentsGroupID) {
            //    // This stage is not available for user.
            //    callback(false);
            //    return;
            //}

            // Checking if current stage is available by date criteria.
            var dateNow = new Date();
            if (!(stage_description.feedback_stage.date_from < dateNow
                && stage_description.feedback_stage.date_to > dateNow)) {
                // This stage is outdated or too far in the future.
                callback(false);
                return;
            }

            // Checking if user has already voted for this survey.
            var votedUsers = utilsController.toNormalArray(stage_description.voted_users);
            if (votedUsers.some(function(votedUser) {
                return votedUser.account_id == studentID;
            })) {
                callback(false);
            }

            // All checks are passed - student can vote for chosen stage.
            callback(true);
        });

    // User is not authorized - impossible to vote for him.
    } else {
        callback(false);
    }
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