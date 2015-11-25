var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('pages/index', { title: 'Добро пожаловать!' });
});

/* STUDENTS SECTION */

/* Student's survey */
router.get('/survey', function(req, res, next) {
   res.render('pages/survey', { title: 'Страница опроса' });
});

/* Screen after finishing student's survey */
router.get('/survey/finish', function(req, res, next) {
    res.render('pages/survey/finish')
});

/* ADMIN SECTION */

/* Root administrator's screen */
router.get('/maintaining', function(req, res, next) {
    res.render('pages/maintaining')
});

/* Here admin can add new surveys */
router.get('/maintaining/create', function(req, res, next) {
    res.render('pages/maintaining/create')
});

/* Here admin can schedule surveys */
router.get('/maintaining/schedule', function(req, res, next) {
    res.render('pages/maintaining/schedule')
});

/* Results of surveys */
router.get('/maintaining/results', function(req, res, next) {
    res.render('pages/maintaining/results')
});

module.exports = router;