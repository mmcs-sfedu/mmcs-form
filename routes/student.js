var express = require('express');
var router = express.Router();

var authController = require('../controllers/auth');
var errorsController = require('../controllers/errors');

router.all('/logout', function(req, res, next) {
    authController.studentLogout();
    res.redirect('/survey');
});

router.post('/login', function(req, res, next) {
    /* Checking user's input first */
    req.checkBody('login').notEmpty();
    req.checkBody('password').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        errorsController.saveErrorInSession(req, "Заполните все поля!");
        res.redirect('/survey');
        return;
    }

    authController.studentAttemptLogin(
        req.body['login'],
        req.body['password'],
        function(error) {
            if (error)
                errorsController.saveErrorInSession(req, error);
            res.redirect('/survey');
    });
});

module.exports = router;