/* Importing controllers. */
var authController    = require('../controllers/auth');
var utilsController   = require('../controllers/utils');

var request = require('request');

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
    models.feedback_stage.findAll({
        attributes: { exclude: ['createdAt', 'updatedAt'] }, // trash attributes
        where: {
            date_to:   { $gt: dateNow.toISOString() }, // actual for current date
            date_from: { $lt: dateNow.toISOString() }
        },
        // We also want to get form's name.
        include:
        [
            {
                attributes: ['name'],
                model: models.feedback_form
            },
            {
                attributes: { exclude: ['createdAt', 'updatedAt'] },
                model: models.voted_user,
                where: {
                    account_id: authorizedUserId
                },
                required: false
            }
        ]
    }).then(function(stages) {

        var normalStages = utilsController.toNormalArray(stages);


        request.get(
            'http://users.mmcs.sfedu.ru/~test_rating/api/v0/subject/listForStudentID?' +
            'token=fc0e5f16a22c3196e052d7fdf20a710f19419607' + '&' +
            'studentID=' + authorizedUserId,
            { form: {} },
            function (error, response, body) {

                var parsed = JSON.parse(body);
                if (!parsed)
                    return callback([]);

                if (!error && response.statusCode == 200) {
                    var resp = parsed['response'];

                    for (var stageInd in normalStages) {
                        var stage = normalStages[stageInd];

                        var dateFrom = new Date(stage['date_from']);
                        var dateTo = new Date(stage['date_to']);
                        stage['date_from'] = dateFrom.getDate() + "." + (dateFrom.getMonth() + 1) + "." + dateFrom.getFullYear();
                        stage['date_to'] = dateTo.getDate() + "." + (dateTo.getMonth() + 1) + "." + dateTo.getFullYear();

                        var bannedDisciplines = {};
                        var bannedTeachers = [];

                        // Проверка на лимит 2 дисциплин.
                        for (var vUserInd in stage['voted_users']) {
                            var votedUser = stage['voted_users'][vUserInd];

                            bannedTeachers.push(votedUser['teacher_id']);

                            if (bannedDisciplines[votedUser['discipline_id']] == null) {
                                bannedDisciplines[votedUser['discipline_id']] = 1;
                            } else
                                bannedDisciplines[votedUser['discipline_id']] += 1;
                        }

                        // Добавляем список дисциплин в этапы.
                        stage['disciplines'] = [];
                        for (var discInd in resp) {
                            var discipline = resp[discInd];
 			    if(discipline.DisciplineName == 'Иностранный язык' || discipline.DisciplineName == 'Курсовая работа' || discipline.DisciplineName=='Английский язык' || discipline.DisciplineName == 'Немецкий язык' || discipline.DisciplineName == 'Французский язык') {
			       continue;
		            }                            

                            if ((bannedDisciplines[discipline['ID']] == null || bannedDisciplines[discipline['ID']] < 2)) {

                                for (var teacherInd in bannedTeachers) {
                                    var teacher = bannedTeachers[teacherInd];

                                    for (var discTecInd in discipline['Teachers']) {
                                        if (teacher == discipline['Teachers'][discTecInd]['ID']) {
                                            discipline['Teachers'].splice(discTecInd, 1);
                                        }
                                    }
                                }

                                stage['disciplines'].push(discipline);
                            }
                        }
                    }

                    return callback(normalStages);
                }

                return callback([]);
            }
        );




        //
        // /* Parsing to normal JS object from Sequelize format. */
        // var normalJsResult = utilsController.toNormalArray(result);
        //
        //
        // /* Here will be response data with populated labels from BRS. */
        // var desiredStageDescriptions = [];
        //
        //
        // /* Iterating throw all stage descriptions to find ones, where current user didn't vote yet. */
        // normalJsResult.forEach(function(sd) {
        //     // Boolean var to check if current user has already voted.
        //     var userVoted = sd['voted_users'].some(function(votedUser) {
        //         return votedUser['account_id'].valueOf() == authorizedUserId.valueOf();
        //     });
        //     // Only if user hasn't voted in that stage yet.
        //     if (!userVoted) {
        //         // We don't want to send voted users data to client.
        //         delete sd['voted_users'];
        //
        //         // Pushing checked and populated with BRS data object to response array.
        //         desiredStageDescriptions.push(sd);
        //     }
        // });
        //
        // // console.log(desiredStageDescriptions);
        //
        // /* Returning prepared data about surveys. */
        // callback(desiredStageDescriptions);
    });
}

/**
 * Returns found form in a callback. Form can be null, if something went wrong.
 * @param {Number} stageDescriptionId ID of the stage to choose right form.
 * @param {Function} callback A callback which returns null or found form.
 * */
function getFormsQuestionsForStage(stageDescriptionId, discData, callback) {
    /* Getting feedback form. */
    models.feedback_form.findAll({
        attributes: { exclude: ['createdAt', 'updatedAt'] }, // useless trash
        include: [
            {
                // Where stage description equals stated in source param.
                attributes: { exclude: ['createdAt', 'updatedAt'] },
                model: models.feedback_stage,
                where: { id: stageDescriptionId }
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

        // // For fast access.
        // var discipline = formJsObject.feedback_stages[0].stage_descriptions[0].discipline;

        // Populating data about the discipline.
        formJsObject['subject'] = discData['discipline'];
        formJsObject['teacher'] = discData['teacher_ln'] + " " + discData['teacher_fn'] + " " + discData['teacher_sn'];

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
function checkStageAvailabilityForUser(stageDescriptionId, disciplineID, teacherID, session, callback) {
    // Getting and checking student's group (deprecated) and ID first of all.
    // var studentsGroupID = authController.getStudentsGroupId(session);
    var studentID       = authController.getStudentsAuthorization(session);
    if (studentID) {

        /* Date border to choose only actual surveys. */
        var dateNow = new Date();

        /* Getting all possible stage descriptions. */
        models.feedback_stage.findOne({
            attributes: { exclude: ['createdAt', 'updatedAt'] }, // trash attributes
            where: {
                id: stageDescriptionId,
                date_to:   { $gt: dateNow.toISOString() }, // actual for current date
                date_from: { $lt: dateNow.toISOString() }
            },
            // We also want to get form's name.
            include:
                [
                    {
                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                        model: models.voted_user,
                        where: {
                            account_id: studentID
                        },
                        required: false
                    }
                ]
        }).then(function(stage) {

            if (!stage || stage.length == 0) {
                return callback(false);
            }


            // var normalStage = utilsController.toNormalArray(stage);



            request.get(
                'http://users.mmcs.sfedu.ru/~test_rating/api/v0/subject/listForStudentID?' +
                'token=fc0e5f16a22c3196e052d7fdf20a710f19419607' + '&' +
                'studentID=' + studentID,
                {form: {}},
                function (error, response, body) {

                    var parsed = JSON.parse(body);
                    if (!parsed) {
                       return callback(false);
                    }

                    if (!error && response.statusCode == 200) {

                        var resp = parsed['response'];

                            var bannedDisciplines = {};
                            var bannedTeachers = [];



                            // Проверка на лимит 2 дисциплин.
                            for (var vUserInd in stage['voted_users']) {
                                var votedUser = stage['voted_users'][vUserInd];
                                bannedTeachers.push(votedUser['teacher_id']);
                                if (bannedDisciplines[votedUser['discipline_id']] == null) {
                                    bannedDisciplines[votedUser['discipline_id']] = 1;
                                } else
                                    bannedDisciplines[votedUser['discipline_id']] += 1;
                            }

                            // Ищем дисциплину для проверки.
                            for (var discInd in resp) {
                                var discipline = resp[discInd];

                                if (discipline['ID'] == disciplineID) {

                                    if (bannedDisciplines[discipline['ID']] == null || bannedDisciplines[discipline['ID']] < 2) {

                                        // Проверка, что уже голосовал за учителя.
                                        for (var teacherInd in bannedTeachers) {
                                            var teacher = bannedTeachers[teacherInd];
                                            for (var discTecInd in discipline['Teachers']) {
                                                if (teacher == teacherID && teacher == discipline['Teachers'][discTecInd]['ID']) {
                                                    return callback(false);
                                                }
                                            }
                                        }



                                        var discName = discipline['DisciplineName'];
                                        var teacherLN = "";
                                        var teacherFN = "";
                                        var teacherSN = "";
                                        for (var teacherInd2 in discipline['Teachers']) {
                                            var teacher2 = discipline['Teachers'][teacherInd2];
                                            if (teacher2['ID'] == teacherID) {
                                                teacherLN = teacher2['LastName'];
                                                teacherFN = teacher2['FirstName'];
                                                teacherSN = teacher2['SecondName'];
                                            }
                                        }

                                        return callback({ discipline : discName, teacher_fn: teacherFN, teacher_sn: teacherSN, teacher_ln: teacherLN });
                                    } else {
                                        return callback(false);
                                    }
                                }


                            }

                        return callback(false);
                    }

                    return callback(false);
                }
            );

        });

        // // Looking for stage description with provided ID.
        // models.stage_description.findOne({
        //     where: { id: stageDescriptionId },
        //     attributes: { exclude: ['createdAt', 'updatedAt'] },
        //     include: [
        //         {
        //             attributes: ['group_id'],
        //             model: models.discipline
        //         },
        //         {
        //             attributes: ['date_from', 'date_to'],
        //             model: models.feedback_stage
        //         },
        //         {
        //             attributes: ['account_id'],
        //             model: models.voted_user
        //         }
        //     ]
        // }).then(function(stage_description) {
        //     // It's impossible to vote for non-existing stage.
        //     if (stage_description == null) {
        //         callback(false);
        //         return;
        //     }
        //
        //     // Checking if chosen stage is available for student's group. Deprecated.
        //     //if (stage_description.discipline.group_id != studentsGroupID) {
        //     //    // This stage is not available for user.
        //     //    callback(false);
        //     //    return;
        //     //}
        //
        //     // Checking if current stage is available by date criteria.
        //     var dateNow = new Date();
        //     if (!(stage_description.feedback_stage.date_from < dateNow
        //         && stage_description.feedback_stage.date_to > dateNow)) {
        //         // This stage is outdated or too far in the future.
        //         callback(false);
        //         return;
        //     }
        //
        //     // Checking if user has already voted for this survey.
        //     var votedUsers = utilsController.toNormalArray(stage_description.voted_users);
        //     if (votedUsers.some(function(votedUser) {
        //         return votedUser.account_id == studentID;
        //     })) {
        //         callback(false);
        //     }
        //
        //     // All checks are passed - student can vote for chosen stage.
        //     callback(true);
        // });

    // User is not authorized - impossible to vote for him.
    } else {
        callback(false);
    }
}

/**
 * Saves user's answer for survey.
 * @param {Object} req To provide a session for some functions.
 * @param {Integer} stageId Survey ID.
 * @param {Array} usersAnswers User's answers for that survey.
 * @param {Object} res To draw response page.
 */
function saveUsersAnswer(req, usersAnswers, stageId, disciplineId, disciplineName, teacherId, course, group, degree, teacherFN, teacherSN, teacherLN, res) {
    /* Using same format to get possible answers (user's answers) IDs. */
    usersAnswers = JSON.parse('[' + usersAnswers + ']');

    /* Preparing array for bulk insert. */
    var answers = [];
    for (var i = 0; i < usersAnswers.length; i++) {
        answers.push({
            possible_answer_id: usersAnswers[i],
            feedback_stage_id: stageId,
            teacher_id: teacherId,
            discipline_id: disciplineId,
            createdAt: new Date(),
            updatedAt: new Date(),
            student_course: course,
            student_group: group,
            student_degree: degree
        });
    }


    function transact() {
        /* Transaction to insert both voted user and his answers data. */
        return models.sequelize.transaction(
            { autocommit: false },   // without false param returns an error
            function (t) {
                return models.voted_user
                    .create({           // creating voted user record
                        feedback_stage_id: stageId,
                        account_id: authController.getStudentsAuthorization(req.session),
                        discipline_id: disciplineId,
                        teacher_id: teacherId,

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

    function teachers() {
        return utilsController.updateOrCreate(models.teacher, {id:teacherId},
            {id:teacherId, discipline_id: disciplineId, first_name:teacherFN, second_name:teacherSN, last_name:teacherLN, createdAt: new Date(), updatedAt: new Date()},
            function () {
                return transact();
            },
            function () {
                return transact();
            });
    }

    return utilsController.updateOrCreate(models.discipline, {id:disciplineId},
        {id:disciplineId, name:disciplineName, createdAt: new Date(), updatedAt: new Date()},
        function () {
            return teachers();
        },
        function () {
            return teachers();
        });
}
