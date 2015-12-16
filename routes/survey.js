var express = require('express');
var router = express.Router();

// importing controller to call server side js methods from it in jade template
var surveyController = require('../controllers/survey');
var errorsController = require('../controllers/errors');

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
router.post('/finish', function(req, res, next) {
    res.render('pages/survey/finish')
});

module.exports = router;