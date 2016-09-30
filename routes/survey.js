var express = require('express');
var router = express.Router();

// importing controller to call server side js methods from it in jade template
var surveyController = require('../controllers/survey');
// some util controllers
var errorsController = require('../controllers/errors');
var authController   = require('../controllers/auth');

// this is an array of before-check functions: if student wasn't authorized - redirecting him on the surveys page
var checklist = [authController.getStudentAuthChecker()];

/* STUDENTS SECTION */

/* Student's survey */
router.get('/', function(req, res, next) {
    // // Checking if user needs authorization - redirecting him on the corresponding page.
    // if (!authController.getStudentsAuthorization(req.session))
    //     return res.redirect('/student/login2');

    /* Getting errors saved in session, if we have some. */
    var possibleErrors = errorsController.fetchErrorFromSession(req);

    /* Getting stage descriptions first - don't worry, it won't touch db, if user wasn't authorized. */
    surveyController.getStageDescriptions(req, function(stages) {
        res.render('pages/survey', {
            title: 'Страница опроса',
            controller: surveyController, // now controller is available using this var
            surveys: stages,              // passing surveys to view
            errors: possibleErrors        // passing errors to make view render them
        });
    });
});

router.post('/chosen', checklist, function (req, res, next) {
    var stageID = req.body['feedback_stage_id'];
    var disciplineID = req.body['discipline_id'];
    var teacherID = req.body['teacher_id'];

    var possibleErrors = errorsController.fetchErrorFromSession(req);

    surveyController.checkStageAvailabilityForUser(stageID, disciplineID, teacherID, req.session, function (checkResult) {
        if (checkResult) {
            surveyController.getFormsQuestionsForStage(stageID, checkResult, function(form) {
                res.render('pages/survey/chosen', {
                    title: 'Прохождение опроса',
                    controller: surveyController, // now controller is available using this var
                    form: form,                   // passing form's questions to the client
                    stageID: stageID,
                    disciplineID: disciplineID,
                    teacherID: teacherID,
                    errors: possibleErrors        // passing errors to make view render them
                });
            });
        } else {
            res.redirect('back');
        }
    })
});

/* Show questions for chosen survey */
router.get('/:id', checklist, function(req, res, next) {
    // Saving stage ID param into some variable.
    var stageDescriptionID = req.params['id'];

    /* Getting errors saved in session, if we have some. */
    var possibleErrors = errorsController.fetchErrorFromSession(req);

    // Checking availability of this stage for student.
    surveyController.checkStageAvailabilityForUser(stageDescriptionID, req.session, function(checkResult) {
        // This survey is available for student so we can load questions for it.
        if (checkResult) {

            // Getting all questions for chosen stage's form.
            surveyController.getFormsQuestionsForStage(stageDescriptionID, function(form) {
                res.render('pages/survey/chosen', {
                    title: 'Прохождение опроса',
                    controller: surveyController, // now controller is available using this var
                    form: form,                   // passing form's questions to the client
                    errors: possibleErrors        // passing errors to make view render them
                });
            });
        } else {
            // This survey is unavailable for authorized user - so redirecting him back.
            res.redirect('back');
        }
    });
});

/* Screen after finishing student's survey */
router.post('/finish', checklist, function(req, res, next) {
    /* Checking if data at least provided. */
    req.checkBody('feedback_stage_id').notEmpty();
    req.checkBody('discipline_id').notEmpty();
    req.checkBody('teacher_id').notEmpty();
    req.checkBody('possible_answers').notEmpty();
    var errors = req.validationErrors();
    if (errors) { // if some data wasn't provided - rendering an error
        res.render('error', {
            message: 'Каким-то непонятным образом не передались параметры опроса.',
            error: {}
        });
        return;
    }

    // Checking if student can vote for this stage at all.
    surveyController.checkStageAvailabilityForUser(req.body['feedback_stage_id'], req.body['discipline_id'], req.body['teacher_id'], req.session, function(checkResult) {
        // Yes, he can vote for this stage.
        if (checkResult) {
            /* Saving student's answer */
            surveyController.saveUsersAnswer(
                req,
                req.body['possible_answers'],     // user's answers
                req.body['feedback_stage_id'], // answered stage
                req.body['discipline_id'],
                checkResult['discipline'],
                req.body['teacher_id'],
                checkResult['teacher_fn'],
                checkResult['teacher_sn'],
                checkResult['teacher_ln'],
                res                               // res to draw response page
            );
        } else {
            // Looks like we've got a cheater - returning him back with an error.
            errorsController.saveErrorInSession(req, 'Что-то пошло не так во время сохранения результатов опроса');
            res.redirect('back');
        }
    });
});

/* To return questions with answers for chosen stage. For async ajax request. */
router.get('/forms', checklist, function(req, res, next) {
    /* Getting stage description ID from request. */
    var stageDescriptionId = req.query.stage_description_id;

    /* Sending found form back (can be null, if stage ID is malformed). */
    surveyController.getFormsQuestionsForStage(stageDescriptionId, function(form) {
        res.send(form);
    });
});

module.exports = router;