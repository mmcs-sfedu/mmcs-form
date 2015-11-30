var express = require('express');
var router = express.Router();

// importing controller to call server side js methods from it in jade template
var surveyController = require('../controllers/survey');

/* STUDENTS SECTION */

/* Student's survey */
router.get('/', function(req, res, next) {
    /* test data */
    var json = '{"feedbackForm": [{"title": "Насколько полезен с вашей точки зрения данный предмет?","type": "radio","options": ["5","4","3","2","1"]}]}';
    var parsedJson = JSON.parse(json);
    res.render('pages/survey', { title: 'Страница опроса' , data: parsedJson["feedbackForm"]});
});

/* Screen after finishing student's survey */
router.get('/finish', function(req, res, next) {
    res.render('pages/survey/finish')
});

module.exports = router;