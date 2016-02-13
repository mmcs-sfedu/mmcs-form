var express = require('express');
var router = express.Router();

/* To get an access to db. */
var models = require('../models');

/* Utils controllers. */
var authController = require('../controllers/auth');
var errorsController = require('../controllers/errors');


/* Log out for user and redirect on surveys. */
router.all('/logout', function(req, res, next) {
    authController.studentLogout(req);
    res.redirect('/survey');
});

/* Authorization route for student. */
router.post('/login', function(req, res, next) {
    /* Checking user's input first */
    req.checkBody('login').notEmpty();
    req.checkBody('password').notEmpty();
    var errors = req.validationErrors();
    // If some fields were not provided.
    if (errors) {
        errorsController.saveErrorInSession(req, "Заполните все поля!");
        res.redirect('/survey');
        return;
    }

    // Trying to authorize user with a callback
    authController.studentAttemptLogin(
        req,
        req.body['login'],
        req.body['password'],
        function(error) {
            // In any case reloading survey page, but showing an error in a bad case.
            if (error)
                errorsController.saveErrorInSession(req, error);
            res.redirect('/survey');
    });
});

module.exports = router;