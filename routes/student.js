var express = require('express');
var router = express.Router();

var authController = require('../controllers/auth');

router.all('/logout', function(req, res, next) {
    authController.studentLogout();
    res.redirect('/survey');
});

router.post('/login', function(req, res, next) {
    authController.studentAttemptLogin(function(result) {
        if (result) {
            res.redirect('/survey'); // передать сюды сообщение ошибки
        } else {
            res.redirect('/'); // поменять на сервй
        }
    });
});

module.exports = router;