var express = require('express');
var router = express.Router();

/* Importing controllers */
var errorsController      = require('../controllers/errors');
var authController        = require('../controllers/auth');
var maintainingController = require('../controllers/maintaining');

// To access DB.
var models = require('../models');


/* Pre-routing check functions */
var checklist = [
    /* Checks if user authorized as student or not authorized as admin */
    function(req, res, next) {
        if (authController.getStudentsAuthorization(req.session)) { // if student - go to main page, you can't maintain
            res.redirect('/');
        } else {                                      // in other case - you can access maintaining
            if (authController.isAdminAuthorized(req.session)) { // admin is authorized, everything is ok
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
    functionsToExecute.push(function(callback) {maintainingController.getAllDisciplines(res, function(disciplines) {
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
    maintainingController.getSurveysResults(null, res, function(results) {
        res.render('pages/maintaining/results', {
            title: 'Результаты',
            controller: maintainingController,
            results: results,
            errors: possibleErrors
        })
    });
});

/* To get a survey's result in PDF */
router.get('/results/pdf/:id?', checklist, function(req, res, next) {
    // If we have no provided id - generating for all surveys.
    var whereClause = (typeof req.params.id == "undefined") ? null : {id : req.params.id};

    // Getting generated PDF file's stream.
    maintainingController.getResultStreamPDF(whereClause, res, function(err, stream) {
        // If something went wrong while PDF generation.
        if (err != null)
            res.redirect('/maintaining/results');
        // Everything is ok - sending back generated PDF.
        else
            stream.pipe(res);
    });
});

/* To get a survey's result in CSV */
router.get('/results/csv/:id?', checklist, function(req, res, next) {
    // If we have no provided id - generating for all surveys.
    var whereClause = (typeof req.params.id == "undefined") ? null : {id : req.params.id};

    // Getting generated CSV string.
    maintainingController.getResultStringCSV(whereClause, res, function(err, csv) {
        // If something went wrong while CSV generation.
        if (err != null)
            res.redirect('/maintaining/results');
        // Everything is ok - sending back generated CSV.
        else {
            res.set('Content-Type', 'text/csv; charset=utf-8');
            res.send(csv);
        }
    });
});

/* Disciplines for CRUD */
router.get('/disciplines', checklist, function(req, res, next) {
    // Checking possible stored in session errors.
    var possibleErrors = errorsController.fetchErrorFromSession(req);

    // Preparing data about disciplines.
    maintainingController.getAllDisciplinesWithData(function(disciplines, subjects, teachers, groups) {
        res.render('pages/maintaining/disciplines', {
            title: 'Дисциплины',
            controller: maintainingController,
            disciplines: disciplines,
            subjects: subjects,
            teachers: teachers,
            groups: groups,
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
        req,
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
    authController.adminLogout(req);
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


/* Delete entity by ID */
router.delete('/entity', checklist, function(req, res, next) {
    /* Checking request. */
    req.checkBody('id').notEmpty();
    req.checkBody('type').notEmpty();
    var errors = req.validationErrors();
    if (errors) { // if there is no provided form ID, ajax will show error
        res.send(null);
        return;
    }

    // Getting desired type for deletion.
    var targetModel;
    switch (req.body.type) {
        case "subject":
            targetModel = models.subject;
            break;
        case "teacher":
            targetModel = models.teacher;
            break;
        case "group":
            targetModel = models.group;
            break;
        default: return res.send(null);
    }

    // Looking for desired entity in db.
    targetModel.findOne({
        where: { id: req.body.id }})
        .then(function(entity) {
            // Destroying entity.
            entity.destroy();
            return res.send({id : req.body.id});
        }).catch(function() {
            return res.send(null);
    });
});

/* Add entity */
router.post('/entity', checklist, function(req, res, next) {
    /* Adding entity and sending result. */
    // TODO МЕНЯЕМ ФУНКЦИЮ, ПРОВЕРЯЕМ И ПЕРЕДАЕМ ТИП
    //maintainingController.addForm(req.body, function(result) {
    //    res.send(result);
    //});
});

/* Edit entity */
router.put('/entity', checklist, function(req, res, next) {
    /* Editing entity and sending result. */
    // TODO ФУНКЦИЯ ТА ЖЕ, ПРОВЕРЯЕМ ТИП И НОВОЕ ЗНАЧЕНИЕ
    //maintainingController.addForm(req.body, function(result) {
    //    res.send(result);
    //});
});



module.exports = router;