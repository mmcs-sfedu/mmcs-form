var express = require('express');
var router = express.Router();

/* STUDENTS SECTION */

/* Student's survey */
router.get('/', function(req, res, next) {
    res.render('pages/survey', { title: 'Страница опроса' });
});

/* Screen after finishing student's survey */
router.get('/finish', function(req, res, next) {
    res.render('pages/survey/finish')
});

module.exports = router;