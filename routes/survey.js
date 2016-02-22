var express = require('express');
var router = express.Router();

// importing controller to call server side js methods from it in jade template
var surveyController = require('../controllers/survey');
// some util controllers
var errorsController = require('../controllers/errors');
var authController   = require('../controllers/auth');

// this is an array of before-check functions: if student wasn't authorized - redirecting him on the surveys page
var checklist = [authController.getStudentAuthChecker()];

/* STUDENTS SECTION */

/* Student's survey */
router.get('/', function(req, res, next) {
    /* Getting errors saved in session, if we have some. */
    var possibleErrors = errorsController.fetchErrorFromSession(req);

    /* Getting stage descriptions first - don't worry, it won't touch db, if user wasn't authorized. */
    surveyController.getStageDescriptions(req, function(stageDescriptions) {
        res.render('pages/survey', {
            title: 'Страница опроса',
            controller: surveyController, // now controller is available using this var
            surveys: stageDescriptions,   // passing surveys to view
            errors: possibleErrors        // passing errors to make view render them
        });
    });
});

/* Show questions for chosen survey */
router.get('/:id', checklist, function(req, res, next) {

    res.send(req.params['id']);

    // TODO ПРОВЕРЯТЬ ДОСТУПНОСТЬ ФОРМЫ ДЛЯ ЮЗЕРА И СЛАТЬ ЕМУ ДАННЫЕ ВОПРОСОВ ДЛЯ РЕНДЕРА

    // TODO ДОБАВИТЬ ПРОВЕРКУ ДОСТУПНОСТИ ФОРМЫ В САБМИТЕ

});

/* Screen after finishing student's survey */
router.post('/finish', checklist, function(req, res, next) {
    /* Checking if data at least provided. */
    req.checkBody('stage_description_id').notEmpty();
    req.checkBody('possible_answers').notEmpty();
    var errors = req.validationErrors();
    if (errors) { // if some data wasn't provided - rendering an error
        res.render('error', {
            message: 'Каким-то непонятным образом не передались параметры опроса.',
            error: {}
        });
        return;
    }

    /* Saving user's answer */
    surveyController.saveUsersAnswer(
        req,
        req.body['stage_description_id'], // answered stage
        req.body['possible_answers'],     // user's answers
        res                               // res to draw response page
    );
});

/* To return questions with answers for chosen stage. For async ajax request. */
router.get('/forms', checklist, function(req, res, next) {
    /* Getting stage description ID from request. */
    var stageDescriptionId = req.query.stage_description_id;

    /* Sending found form back (can be null, if stage ID is malformed). */
    surveyController.getFormsQuestionsForStage(stageDescriptionId, function(form) {
        res.send(form);
    });
});

module.exports = router;