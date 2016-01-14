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

    /* Saving user's answer */
    surveyController.saveUsersAnswer(
        req.body['stage_description_id'], // answered stage
        req.body['possible_answers'],     // user's answers
        res                               // res to draw response page
    );
});

module.exports = router;