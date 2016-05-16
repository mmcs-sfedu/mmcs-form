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





// Vars for OpenID strategy for correct return urls for student auth.
var passport = require('passport'),
    OpenIDStrategy = require('passport-openid').Strategy;

// Preliminary route for oid configs.
router.post('/login2', function(req, res, next) {

    // Configuring passport and strategy.
    passport.use(new OpenIDStrategy({
            // Where to return after OpenID auth.
            returnURL: req.protocol + '://' + req.get('host') + '/student/postoid',
            realm: req.protocol + '://' + req.get('host')
        },
        // Callback to provide an identifier to user.
        function(identifier, done) {
            return done(null, identifier);
        }
    ));

    // Required for OpenID functions.
    passport.serializeUser(function(user, done) { done(null, user); });
    passport.deserializeUser(function(user, done) { done(null, user); });

    // Starting auth via OpenID.
    res.redirect('/student/oid?openid_identifier=' + req.body['openid_identifier']);
});

// OpenID auth.
router.get('/oid', passport.authenticate('openid'));

// Return URL for OpenID.
router.get('/postoid',
    passport.authenticate('openid', {
        successRedirect: '/survey',
        failureRedirect: '/survey228' })); // TODO BAD RESULT URL, AUTH AND UNAUTH LOGIC IN SESSION, HTML LAYOUT





module.exports = router;