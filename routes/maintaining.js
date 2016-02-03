var express = require('express');
var router = express.Router();

/* Importing controllers */
var errorsController      = require('../controllers/errors');
var authController        = require('../controllers/auth');
var maintainingController = require('../controllers/maintaining');

/* Pre-routing check functions */
var checklist = [
    /* Checks if user authorized as student or not authorized as admin */
    function(req, res, next) {
        if (authController.getStudentsAuthorization()) { // if student - go to main page, you can't maintain
            res.redirect('/');
        } else {                                      // in other case - you can access maintaining
            if (authController.isAdminAuthorized()) { // admin is authorized, everything is ok
                next();
            } else {                                  // in other case redirecting him on maintaining

                if (req.path == '/login') {           // to allow admin log in
                    next();
                    return;
                }

                if (req.path == '/') {
                    next();                           // to avoid same route collision
                } else {
                    res.redirect('/maintaining')
                }
            }
        }
    }
];

/* ADMIN SECTION */

/* Root administrator's screen */
router.get('/', checklist, function(req, res, next) {
    /* Saved in session errors. */
    var possibleErrors = errorsController.fetchErrorFromSession(req);

    /* Rendering index page for maintaining. */
    res.render('pages/maintaining', {
        title: 'Администрирование системы анкетирования',
        controller: maintainingController,                // controller to check authorizations and else
        errors: possibleErrors
    })
});

/* Here admin can add new surveys */
router.get('/create', checklist, function(req, res, next) {
    /* Session errors. */
    var possibleErrors = errorsController.fetchErrorFromSession(req);

    // Preparing data about forms for page.
    maintainingController.getExistingFormsData(function(forms) {
        res.render('pages/maintaining/create', {
            title: 'Формы',
            controller: maintainingController,
            forms: forms,
            errors: possibleErrors
        })
    });
});

/* Here admin can schedule surveys */
router.get('/schedule', checklist, function(req, res, next) {
    /* To get errors from session. */
    var possibleErrors = errorsController.fetchErrorFromSession(req);


    /* To make multiple functions work in different threads together and wait when all of them will be finished together. */
    var async = require('async');

    /* Here will be results of get functions. */
    var preparedStages, preparedForms, preparedDisciplines;

    /* Array of the functions to be executed together. Callbacks are necessary for parallel! */
    var functionsToExecute = [];
    // Preparing data about stages for page.
    functionsToExecute.push(function(callback) {maintainingController.getAllStagesData(res, function(stages) {
        preparedStages = stages;
        callback(null, stages);
    })});
    // Getting all existing forms which can be used with stages
    functionsToExecute.push(function(callback) {maintainingController.getExistingFormsData(function(forms) {
        preparedForms = forms;
        callback(null, forms);
    })});
    // Then getting all disciplines from BRS.
    functionsToExecute.push(function(callback) {maintainingController.getAllBrsDisciplines(res, function(disciplines) {
        preparedDisciplines = disciplines;
        callback(null, disciplines);
    })});

    /* Running an array of functions. */
    async.parallel(functionsToExecute, function(err, result) {
        /* Error is impossible here */
        if (err)
            res.send('Произошла ошибка асинхронного получения данных.');


        /* And finally rendering page. */
        res.render('pages/maintaining/schedule', {
            title: 'Опросы',
            controller: maintainingController,
            stages: preparedStages,
            forms: preparedForms,
            disciplines: preparedDisciplines,
            errors: possibleErrors
        })
    });
});

/* Results of surveys */
router.get('/results', checklist, function(req, res, next) {
    // Checking possible stored in session errors.
    var possibleErrors = errorsController.fetchErrorFromSession(req);

    // Preparing data about results of surveys.
    maintainingController.getSurveysResults(res, function(results) {
        res.render('pages/maintaining/results', {
            title: 'Результаты',
            controller: maintainingController,
            results: results,
            errors: possibleErrors
        })
    });
});


/* To authorize admin */
router.post('/login', checklist, function(req, res, next) {
    /* Checking administrator's input first */
    req.checkBody('login').notEmpty();
    req.checkBody('password').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        errorsController.saveErrorInSession(req, "Заполните все поля!");
        res.redirect('/maintaining');
        return;
    }

    /* If all fields are provided - trying to login */
    authController.adminAttemptLogin(
        req.body['login'],
        req.body['password'],
        function(error) { // callback with auth result
            if (error)
                errorsController.saveErrorInSession(req, error);
            res.redirect('/maintaining');
        });
});

/* To finish admin session */
router.all('/logout', function(req, res, next) {
    authController.adminLogout();
    res.redirect('/maintaining');
});



/* API SECTION */

/* Delete form by ID */
router.delete('/form', checklist, function(req, res, next) {
    /* Checking request. */
    req.checkBody('id').notEmpty();
    var errors = req.validationErrors();
    if (errors) { // if there is no provided form ID, ajax will show error
        res.send(null);
        return;
    }

    /* Deleting form using controller function. */
    maintainingController.deleteForm(req.body['id'], function(result) {
        res.send(result);
    });
});

/* Add form */
router.post('/form', checklist, function(req, res, next) {
    /* Adding form and sending result. */
    maintainingController.addForm(req.body, function(result) {
        res.send(result);
    });
});

/* Delete stage by ID */
router.delete('/stage', checklist, function(req, res, next) {
    /* Checking request. */
    req.checkBody('id').notEmpty();
    var errors = req.validationErrors();
    if (errors) { // if there is no provided form ID, ajax will show error
        res.send(null);
        return;
    }

    /* Deleting stage using controller function. */
    maintainingController.deleteStage(req.body['id'], function(result) {
        res.send(result);
    });
});

/* Add stage */
router.post('/stage', checklist, function(req, res, next) {
    /* Checking request. */
    req.checkBody('date_from').notEmpty();
    req.checkBody('date_to').notEmpty();
    req.checkBody('feedback_form_id').notEmpty();
    req.checkBody('disciplines').notEmpty();
    var errors = req.validationErrors();
    if (errors) { // if there is some data which is not provided
        res.send(null);
        return;
    }

    /* Adding stage and sending result. */
    maintainingController.addStage(req.body, function(result) {
        res.send(result);
    });
});

module.exports = router;