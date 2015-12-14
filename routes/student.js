var express = require('express');
var router = express.Router();

var authController = require('../controllers/auth');

router.all('/logout', function(req, res, next) {
    authController.studentLogout();
    res.redirect('/survey');
});

module.exports = router;