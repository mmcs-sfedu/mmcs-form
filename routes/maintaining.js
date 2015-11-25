var express = require('express');
var router = express.Router();

/* ADMIN SECTION */

// array of functions which will be executed before
var checklist = [authChecker];

function authChecker(req, res, next) {
//    if (req.session.auth || req.path==='/auth') {
//        next();
//    } else {
//        res.redirect("/auth");
//    }
    next();
}

/* Root administrator's screen */
router.get('/', checklist, function(req, res, next) {
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