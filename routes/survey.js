var express = require('express');
var router = express.Router();

var models = require('../models');

// importing controller to call server side js methods from it in jade template
var surveyController = require('../controllers/survey');
var errorsController = require('../controllers/errors');
var authController   = require('../controllers/auth');

var checklist = [authController.getStudentAuthChecker()];

/* STUDENTS SECTION */

/* Student's survey */
router.get('/', function(req, res, next) {
    var possibleErrors = errorsController.fetchErrorFromSession(req);

    surveyController.getStageDescriptions(function(entities) {
        res.render('pages/survey', {
            title: 'Страница опроса',
            controller: surveyController, // now controller is available using second var
            surveys: entities,            // unfortunately there is no way to pass actual surveys to view
            errors: possibleErrors
        });
    });
});

/* Screen after finishing student's survey */
router.post('/finish', checklist, function(req, res, next) {
    req.checkBody('stage_description_id').notEmpty();
    req.checkBody('possible_answers').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        res.send('Каким-то непонятным образом не передались параметры опроса.');
        return;
    }

    var stageDescriptionId = req.body['stage_description_id'];
    var possibleAnswers    = req.body['possible_answers'];
    possibleAnswers = possibleAnswers.split(',');


    var answers = [];
    for (var i = 0; i < possibleAnswers.length; i++) {
        answers.push({
            possible_answer_id   : possibleAnswers[i],
            stage_description_id : stageDescriptionId,
            createdAt            : new Date(),
            updatedAt            : new Date()
        });
    }


    // TODO нужна транзакция!
//    models.sequelize.transaction(function (t) { // chain all queries
        return models.voted_user.create({
            stage_description_id : stageDescriptionId,
            account_id           : authController.isStudentAuthorized(),
            createdAt            : new Date(),
            updatedAt            : new Date()
        }).then(function() {
            return models.answer.bulkCreate(answers);
        }).then(function() {
            res.render('pages/survey/finish')
        });
//    });
//    .then(function (result) {
//        // Transaction has been committed
//        // result is whatever the result of the promise chain returned to the transaction callback
//    }).catch(function (err) {
//        // Transaction has been rolled back
//        // err is whatever rejected the promise chain returned to the transaction callback
//    });
});

module.exports = router;