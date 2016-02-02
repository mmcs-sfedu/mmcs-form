var express = require('express');
var router = express.Router();

var models = require('../models');


var authController = require('../controllers/auth');
var errorsController = require('../controllers/errors');
var utilsController = require('../controllers/utils');


// array of functions which will be executed before
var checklist = [authController.getStudentAuthChecker()];


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

router.get('/forms'///:id'
    , checklist, function(req, res, next) {
        // console.log(req.params.id);
        var stageDescId = req.query.stage_description_id;

        models.feedback_form.findAll({
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            include: [
                {
                    attributes: { exclude: ['createdAt', 'updatedAt'] },
                    model: models.feedback_stage,
                    include: [
                        {
                            attributes: { exclude: ['createdAt', 'updatedAt'] },
                            model: models.stage_description,
                            where: { id: stageDescId }
                        }
                    ]
                },
                {
                    attributes: { exclude: ['createdAt', 'updatedAt'] },
                    model: models.question,
                    include: [
                        {
                            attributes: { exclude: ['createdAt', 'updatedAt'] },
                            model: models.possible_answer
                        }
                    ]
                }
            ]
        }).then(function(forms) {
            res.send(utilsController.toNormalArray(forms)[0]);
        });
});

module.exports = router;