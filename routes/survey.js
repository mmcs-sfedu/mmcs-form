var express = require('express');
var router = express.Router();

// importing controller to call server side js methods from it in jade template
var surveyController = require('../controllers/survey');

/* STUDENTS SECTION */

/* Student's survey */
router.get('/', function(req, res, next) {
    res.render('pages/survey', { title: 'Страница опроса', controller: surveyController }); // now controller is available using second var
});

/* Screen after finishing student's survey */
router.get('/finish', function(req, res, next) {
    res.render('pages/survey/finish')
});

module.exports = router;