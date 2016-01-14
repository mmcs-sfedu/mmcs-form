var authController = require('../controllers/auth');
var brsDataController = require('../controllers/brs');

var models = require('../models');

module.exports =
{
    authModule : authController,



    getTestData : function() {
        var json = '{"feedbackForm": [{"title": "Насколько полезен с вашей точки зрения данный предмет?","type": "radio","options": ["5","4","3","2","1"]}]}';
        return JSON.parse(json)['feedbackForm'];
    },



//    getSavedSurveysQuery : function() {
//        return surveyControllerNamespace.savedSurveysQuery;
//    },



    getStageDescriptions : function(callback) {
        var groupId = authController.getGroupId(); // TODO возможно, запрос к БРС
        var userId  = authController.isStudentAuthorized();

        var dateNow = new Date();

        /* Выбираем все возможные тестирования. */
        models.stage_description.findAll({
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            include: [
                {
                    attributes: { exclude: ['createdAt', 'updatedAt'] }, // добавляем записи о пользователях
                    model: models.voted_user
//                    where: { $not : { account_id: [userId] } },
//                    required: false
                },
                {
                    attributes: { exclude: ['createdAt', 'updatedAt'] },
                    model: models.discipline,
                    where: { group_id: [groupId] } // для группы зарегистрировавшегося студента
                },
                {
                    attributes: { exclude: ['createdAt', 'updatedAt'] },
                    model: models.feedback_stage,
                    where: {
                        date_to:   { $gt: dateNow.toISOString() }, // актуальные по времени проведения
                        date_from: { $lt: dateNow.toISOString() }
                    }
                }
            ]
        }).then(function(result) {
            var brsTeachers = brsDataController.getBrsTeachers(groupId); // берём от БРС списки учителей и предметов
            var brsSubjects = brsDataController.getBrsSubjects(groupId);

            var desiredStageDescriptions = [];
            result.forEach(function(sd) { // постобработка - выкидываем записи, для которых пользователь уже проходил опрос
                var shouldAdd = true;
                sd['voted_users'].forEach(function(vUser) {
                    if (vUser['account_id'] == userId) {
                        shouldAdd = false;
                    }
                });
                if (shouldAdd) {
                    brsTeachers.forEach(function(teacher) { // добавляем имя преподавателя по id из БРС
                        if (teacher['id'] == sd['discipline']['teacher_id']) {
                            sd['discipline']['dataValues']['teacher'] = teacher['name']; // внимание, dataValues - хак структуры объекта в Sequelize
                        }
                    });
                    brsSubjects.forEach(function(subject) { // добавляем название дисциплины по id из БРС
                        if (subject['id'] == sd['discipline']['subject_id']) {
                            sd['discipline']['dataValues']['subject'] = subject['name']; // внимание, dataValues - хак структуры объекта в Sequelize
                        }
                    });

                    desiredStageDescriptions.push(sd);
                }
            });

            /* Сохраняем полученные данные возможных опросов для получения идентификаторов в дальнейшем. */
            // surveyControllerNamespace.savedSurveysQuery = desiredStageDescriptions; // возможно, при отправке формы его нужно будет обнулить

            callback(desiredStageDescriptions);
        });
    },



    /**
     * Saves user's answer for survey.
     * @param {Integer} stageDescriptionId Survey ID.
     * @param {Array} possibleAnswers User's answers for that survey.
     * @param {Object} res To draw response page.
     * @return {Null} Returns nothing.
     */
    saveUsersAnswer : function(stageDescriptionId, possibleAnswers, res) {
        /* Using same format to get possible answers (user's answers) IDs */
        possibleAnswers = possibleAnswers.split(',');

        /* Preparing array for bulk insert */
        var answers = [];
        for (var i = 0; i < possibleAnswers.length; i++) {
            answers.push({
                possible_answer_id: possibleAnswers[i],
                stage_description_id: stageDescriptionId,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        /* Transaction to insert both voted user and his answers data */
        return models.sequelize.transaction(
            { autocommit: false },   // without false param returns an error
            function (t) {
            return models.voted_user
                .create({            // creating voted user record
                stage_description_id: stageDescriptionId,
                account_id: authController.isStudentAuthorized(),
                createdAt: new Date(),
                updatedAt: new Date()
            }, { transaction: t })
                .then(function () { // when voted user data inserted, adding his answers
                return models.answer.bulkCreate(answers, { transaction: t });
            });
        }).then(function (result) { // when transaction successfully completed
            res.render('pages/survey/finish');
        }).catch(function (err) {   // when an error occurred with transaction
            res.render('error', {
                message: "Произошла ошибка в транзакции записи результата голосования!",
                error: {}
            });
        });
    }

};

//var surveyControllerNamespace = {
//    savedSurveysQuery : null
//};