var express = require('express');
var router = express.Router();

/* ADMIN SECTION */

/* Root administrator's screen */
router.get('/', function(req, res, next) {
    res.render('pages/maintaining')
});

/* Here admin can add new surveys */
router.get('/create', function(req, res, next) {
    res.render('pages/maintaining/create')
});

/* Here admin can schedule surveys */
router.get('/schedule', function(req, res, next) {
    res.render('pages/maintaining/schedule')
});

/* Results of surveys */
router.get('/results', function(req, res, next) {
    res.render('pages/maintaining/results')
});

module.exports = router;