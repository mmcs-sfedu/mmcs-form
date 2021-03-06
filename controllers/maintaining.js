/* Importing controllers */
var authController = require('../controllers/auth');
var utilsController = require('../controllers/utils');

/* Importing db models helper */
var models = require('../models');

/* Public methods */
module.exports =
{
    authModule: authController,

    getExistingFormsData: getExistingFormsData,

    getAllStagesData: getAllStagesData,

    getAllDisciplines: getAllDisciplines,

    getAllDisciplinesWithData: getAllDisciplinesWithData,

    getSurveysResults: getSurveysResults,

    getResultStreamPDF: getResultStreamPDF,

    getResultStringCSV: getResultStringCSV,

    deleteForm: deleteForm,

    addForm: addForm,

    deleteStage: deleteStage,

    addStage: addStage,

    formatDateForHtml: formatDateForHtml
};



/**
 * Provides data to draw list of existing forms (to delete them) with short info.
 * @param {Function} callback Used to asynchronously return data.
 * */
function getExistingFormsData(callback) {
    /* Getting all forms. */
    models.feedback_form.findAll({
        attributes: { exclude: ['createdAt', 'updatedAt'] }, // we don't like data with dates
        order: 'id',
        include: {
            /* With feedback stages. */
            attributes: ['id'],
            model: models.feedback_stage
        }
    }).then(function(result) {
            /* If something went wrong returning empty array (it's safe). */
            if (result == null) {
                callback([]);
                return;
            }

            /* To convert this value to usual object and make it client-side-readable. */
            result = result.map(function(form){ return form.toJSON() });

            /* Returning result. */
            callback(result);
        }
    );
}

/**
 * Provides a data to draw a list of existing stages (to delete them) with short info.
 * @param {Object} res In a case of error res will be used to instantly render error page.
 * @param {Function} callback Used to asynchronously return data.
 * */
function getAllStagesData(res, callback) {
    /* Getting all feedback stages. */
    models.feedback_stage.findAll({
        attributes: { exclude: ['createdAt', 'updatedAt'] }, // sour data
        order: 'date_to DESC', // last proceeded stage will be at the top
        include: [
            {   // Including form name for that stage.
                attributes: ['name'],
                model: models.feedback_form
            } //,
            // {   // To get an information about disciplines next.
            //     attributes: ['id', 'discipline_id'],
            //     model: models.stage_description,
            //     include: {
            //         // To get an information about discipline, it's teacher and group from BRS.
            //         attributes: { exclude: ['createdAt', 'updatedAt'] },
            //         model: models.discipline,
            //         include: [
            //             {
            //                 attributes: { exclude: ['createdAt', 'updatedAt'] },
            //                 model: models.subject
            //             },
            //             {
            //                 attributes: { exclude: ['createdAt', 'updatedAt'] },
            //                 model: models.teacher
            //             },
            //             {
            //                 attributes: { exclude: ['createdAt', 'updatedAt'] },
            //                 model: models.group
            //             }
            //         ]
            //     }
            // }
            ]
        // Fetching result here.
    }).then(function(result) {
        // If something went wrong return empty array.
        if (result == null) {
            callback([]);
            return;
        }

        /* To convert this value to usual object and make it client-side-readable. */
        result = result.map(function(stage){ return stage.toJSON() });

        callback(result);
    })
}

/**
 * Provides a data to draw a list of existing on disciplines.
 * @param {Object} res In a case of error res will be used to instantly render error page.
 * @param {Function} callback Used to asynchronously return data.
 * */
function getAllDisciplines(res, callback) {
    // Getting all disciplines.
    models.discipline.findAll({
        attributes: { exclude: ['createdAt', 'updatedAt'] }, // sour data
        include: [
            {
                attributes: { exclude: ['createdAt', 'updatedAt'] },
                model: models.subject
            },
            {
                attributes: { exclude: ['createdAt', 'updatedAt'] },
                model: models.teacher
            },
            {
                attributes: { exclude: ['createdAt', 'updatedAt'] },
                model: models.group
            }
        ]
    }).then(function (result) {
        // If something went wrong - return an empty array.
        if (result == null) {
            callback([]);
            return;
        }

        /* To convert this value to usual object and make it client-side-readable. */
        result = result.map(function(discipline){ return discipline.toJSON() });

        callback(result);
    })
}

/**
 * Gets all disciplines from database with subjects data.
 * @param callback Contains disciplines, subjects, teachers and groups.
 * */
function getAllDisciplinesWithData(callback) {
    getAllDisciplines(null, function(disciplines) {
        models.subject.findAll({
            attributes: { exclude: ['createdAt', 'updatedAt'] }
        }).then(function(subjects) {
            models.teacher.findAll({
                attributes: { exclude: ['createdAt', 'updatedAt'] }
            }).then(function(teachers) {
                models.group.findAll({
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                }).then(function(groups) {
                    callback(disciplines,
                        utilsController.toNormalArray(subjects),
                        utilsController.toNormalArray(teachers),
                        utilsController.toNormalArray(groups))
                })
            });
        })
    });
}

/**
 * Provides a data about all surveys' results.
 * @param whereClause Some additional selection rules (filter only specific ids for example).
 * @param {Function} callback Used to asynchronously return data.
 * @param {Object} res To redirect on error page in a bad case.
 * */
function getSurveysResults(whereClause, res, callback) {
    /* It's very difficult to describe: we need all of our full data, excepting voted users IDs to build graphs. */
    models.feedback_stage.findAll({
        attributes: { exclude: ['createdAt', 'updatedAt'] }, // we don't like data with dates
        order: 'date_to DESC',
        where: whereClause,
        include: [
            {
                attributes: { exclude: ['createdAt', 'updatedAt'] },
                model: models.answer,
                required: true,
                include: [
                    {
                        attributes: {exclude: ['createdAt', 'updatedAt']},
                        model: models.discipline
                    },
                    {
                        attributes: {exclude: ['createdAt', 'updatedAt']},
                        model: models.teacher
                    }
                ]
            },
            // {
            //     attributes: { exclude: ['createdAt', 'updatedAt'] },
            //     model: models.discipline,
            //     required: true,
            //     include: [
            //         {
            //             attributes: { exclude: ['createdAt', 'updatedAt'] },
            //             model: models.subject
            //         },
            //         {
            //             attributes: { exclude: ['createdAt', 'updatedAt'] },
            //             model: models.teacher
            //         },
            //         {
            //             attributes: { exclude: ['createdAt', 'updatedAt'] },
            //             model: models.group
            //         }
            //     ]
            // },
            {
                attributes: { exclude: ['createdAt', 'updatedAt'] },
                model: models.voted_user,
                required: true,
                include: [
                    {
                        attributes: {exclude: ['createdAt', 'updatedAt']},
                        model: models.discipline
                    },
                    {
                        attributes: {exclude: ['createdAt', 'updatedAt']},
                        model: models.teacher
                    }
                ]
            },
            {
                attributes: { exclude: ['createdAt', 'updatedAt'] },
                model: models.feedback_form,
                required: true,
                include: {
                    attributes: { exclude: ['createdAt', 'updatedAt'] },
                    model: models.question,
                    required: true,
                    include: {
                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                        model: models.possible_answer,
                        required: true
                    }
                }
            }
        ]
    }).then(function(results) {
            // Something went wrong.
            if (results == null) {
                callback([]);
                return;
            }

            /* To convert this value to usual object and make it client-side-readable. */
            results = results.map(function(result){ return result.toJSON() });


        for (var fsInd in results) {
            var fs = results[fsInd];

            fs['uteachers'] = {};

            for (var ansInd in fs['answers']) {
                var answer = fs['answers'][ansInd];
                fs['uteachers'][answer['teacher']['id']] = answer['teacher'];
                // fs['uteachers'][answer['teacher']['id']]['discipline'] = answer['discipline'];
            }
        }

            callback(results);
        }
    );
}

/**
 * Generates PDF stream for survey if possible.
 * @param whereClause Desired data for PDF generation.
 * @param {Object} res Response object.
 * @param {Function} callback Contains error and PDF stream.
 * */
function getResultStreamPDF(whereClause, res, callback) {
    // Getting data from db for selected survey first.
    getSurveysResults(whereClause, res, function(response) {

        // Checking if provided id was incorrect - returning error.
        if (response.length == 0)
            return callback("No survey for ID was found.", null);

        // Turning on PDF generation module.
        var pdf = require('phantomjs-pdf');

        // To store result content of PDF.
        var pdfContent = "";

        // Generating content of the PDF.
        for (var respIndex = 0; respIndex < response.length; ++respIndex) {
            // For fast access.
            var discipline = response[respIndex].stage_descriptions[0].discipline;
            var questions = response[respIndex].feedback_form.questions;
            var answers = response[respIndex].stage_descriptions[0].answers;
            // var totalVoted = response[respIndex].stage_descriptions[0].voted_users.length;


            // Template.
            pdfContent += 'Результаты анкетирования по форме <b>' + response[respIndex].feedback_form.name + '</b>;<br>' +
                'даты проведения опроса: <b>' + formatDateForHtml(response[respIndex].date_from) + ' - ' + formatDateForHtml(response[respIndex].date_to) + '</b>;<br>' +
                'группа: <b>' + discipline.group.name + '</b>;<br>' +
                'дисциплина: <b>' + discipline.subject.name + ' (' + discipline.teacher.name + ')</b><br><br>';


            // Answers content template.
            for (var i = 0; i < questions.length; ++i) {
                // To print total amount of voters for question.
                var totalVotesInQuestion = 0;

                // Printing question's text.
                pdfContent += '<b>' + questions[i].text + '</b><br>';

                // Counting total amount of voters for question.
                for (var j = 0; j < questions[i].possible_answers.length; j++) {
                    for (var k = 0; k < answers.length; k++) {
                        if (answers[k].possible_answer_id == questions[i].possible_answers[j].id) {
                            totalVotesInQuestion++;
                        }
                    }
                }

                // Counting answers for specific question
                for (j = 0; j < questions[i].possible_answers.length; j++) {
                    var count = 0;
                    for (k = 0; k < answers.length; k++) {
                        if (answers[k].possible_answer_id == questions[i].possible_answers[j].id) {
                            count++;
                        }
                    }

                    // Getting part of votes for that answer from total votes count.
                    // var proportion = count / totalVotesInQuestion * 100;
                    // Rendering answer text
                    pdfContent += questions[i].possible_answers[j].text;
                    pdfContent += ' - ';
                    pdfContent += '<b>' + count + '</b><br>'; // number of answers of that type
                }

                // Total voted string.
                pdfContent += 'Всего проголосовавших: <b>' + totalVotesInQuestion + '</b>';
                if (i != questions.length - 1)
                    pdfContent += '<br><br>';
            }

            // Adding new page space.
            pdfContent += '<br><br><br><br><br>';
        }


        // Generating PDF.
        pdf.convert({
            "html" : pdfContent},
            function(result) {
                // Returning generated PDF stream.
                return callback(null, result.toStream());
            });
    });
}

/**
 * Generates CSV string for survey if possible.
 * @param whereClause Desired data for CSV generation.
 * @param {Object} res Response object.
 * @param {Function} callback Contains error and CSV string.
 * */
function getResultStringCSV(whereClause, res, callback) {
    // Getting data from db for selected survey first.
    getSurveysResults(whereClause, res, function(response) {

        // Checking if provided id was incorrect - returning error.
        if (response.length == 0)
            return callback("No survey for ID was found.", null);

        // Generating header for CSV.
        var csvContent = "form,form_id,date_from,date_to," +
                         "subject,subject_id,teacher,teacher_id,group,group_id," +
                         "question,question_id,answer,answer_id,answered_count\n";


        // Generating content of the CSV.
        for (var respIndex = 0; respIndex < response.length; ++respIndex) {
            // For fast access.
            var discipline = response[respIndex].stage_descriptions[0].discipline;
            var questions = response[respIndex].feedback_form.questions;
            var answers = response[respIndex].stage_descriptions[0].answers;


            // Answers evaluations.
            for (var i = 0; i < questions.length; ++i) {
                // Counting answers for specific question
                for (var j = 0; j < questions[i].possible_answers.length; j++) {
                    var count = 0;
                    for (var k = 0; k < answers.length; k++) {
                        if (answers[k].possible_answer_id == questions[i].possible_answers[j].id) {
                            count++;
                        }
                    }

                    // Form's data.
                    csvContent += response[respIndex].feedback_form.name + ',' + response[respIndex].feedback_form.id + ',';

                    // Data about dates.
                    csvContent += parseInt(response[respIndex].date_from.getTime() / 1000) + ',' + parseInt(response[respIndex].date_to.getTime() / 1000) + ',';

                    // Data about discipline.
                    csvContent += discipline.subject.name + ',' + discipline.subject.id + ',';
                    csvContent += discipline.teacher.name + ',' + discipline.teacher.id + ',';
                    csvContent += discipline.group.name + ',' + discipline.group.id + ',';

                    // Question's data.
                    csvContent += questions[i].text + ',' + questions[i].id + ',';

                    // Answer data.
                    csvContent += questions[i].possible_answers[j].text + ',' + questions[i].possible_answers[j].id + ',';

                    // Total answers data.
                    csvContent += count;

                    // End of the CSV line.
                    csvContent += '\n';
                }
            }
        }


        return callback(null, csvContent);
    });
}

/* DELETE OR ADD FUNCTIONS */

/**
 * Deletes form by ID.
 * @param {Number} id Form's ID.
 * @param {Function} callback Pass null to it to throw error and some JSON to signal about success.
 * */
function deleteForm(id, callback) {
    /* Looking for that form and its child stages. */
    return models.feedback_form.findOne({
        where: { id: id },
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        include: [
            {
                attributes: { exclude: ['createdAt', 'updatedAt'] },
                model: models.feedback_stage
            }
        ]})
        .then(function(feedback_form) {
            /* Destroying form only if it has no stages. */
            if (feedback_form != null && feedback_form['feedback_stages'].length == 0) {
                feedback_form.destroy(); // destroying found form and callback some json to success
                // Good callback which will be parsed.
                callback({ deleted_feedback_form_id: id });
            } else {
                callback(null);          // if form was not found returning null to throw error
            }
        }).catch(function() {            // returning null in callback to show error
                callback(null);
            });
}

/**
 * Deletes stage by ID.
 * @param {Number} id Stage's ID.
 * @param {Function} callback Pass null to it to throw error and some JSON to signal about success.
 * */
function deleteStage(id, callback) {
    /* Looking for this stage. */
    return models.feedback_stage.findOne({
        where: { id: id },
        attributes: { exclude: ['createdAt', 'updatedAt'] }
    }).then(function(feedback_stage) {
            /* Destroying stage. */
            if (feedback_stage != null) {
                feedback_stage.destroy(); // destroying found stage and callback some json to success
                // Good callback to be parsed.
                callback({ deleted_feedback_stage_id: id });
            } else {
                callback(null);           // if stage was not found returning null to throw error
            }
        }).catch(function() {             // returning null in callback to show error
            callback(null);
        });
}

/**
 * Adds form with its questions and answers.
 * @param {Array} body Contents of future form.
 * @param {Function} callback Pass null to it to throw error and return created form as json to signal about success.
 * */
function addForm(body, callback) {
    /* Checking request body name. */
    var name = body['name'];
    if (name == null) {
        callback(null);
        return;
    }

    var description = body['description'];

    /* Checking request body questions array. */
    var questions = body['questions'];
    if (questions == null || Object.keys(questions).length == 0) {
        callback(null);
        return;
    }

    /* That var will contain created form ID. */
    var createdFormID = null;

    /* Beginning transaction (because it's impossible to add a form without questions and answers). */
    models.sequelize.transaction(
        { autocommit: false }, // transactions don't work without that param
        function(t) {
            // Creating feedback form first.
            return models.feedback_form.create({
                name: name,
                description: description,
                createdAt: new Date(),
                updatedAt: new Date()
            }, { transaction: t }) // in the same transaction
                .then(function(feedback_form) {
                    // Saving created form ID.
                    createdFormID = feedback_form.id;

                    /* Preparing data to insert. */
                    var checkedQuestionsToInsert = [];

                    // Walking throw passed by user questions to check that they has all necessary data.
                    for (var questionID in questions) {
                        // Current question.
                        var question = questions[questionID];
                        // Question must have it's text, and some answers.
                        if (question['text'] == null || question['answers'] == null || question['answers'].length == 0) {
                            throw new Error(); // that error will rollback transaction, if some data corrupted
                        }

                        // If data is valid, inserting it in prepared array.
                        checkedQuestionsToInsert.push({
                            feedback_form_id: createdFormID,
                            text: question['text'],
                            createdAt: new Date(),
                            updatedAt: new Date()
                        });
                    }

                    /* Inserting prepared questions in database. */
                    return models.question
                        .bulkCreate(checkedQuestionsToInsert, {
                            transaction: t,    // using same transaction
                            returning: true }) // must specify returning param to make ORM return created elements' ids
                        .then(function(insertedQuestions) {

                            /* Questions are inserted, now preparing answers for them. */
                            var checkedAnswersToInsert = [];
                            // To iterate synchronously with inserted questions (to get their IDs).
                            var iqPointer = -1;

                            // We should differentiate questions (passed by user) and insertedQuestions (which already has IDs).
                            for (var questionID in questions) {
                                var usersPassedQuestion = questions[questionID];
                                iqPointer++; // increasing pointer synchronously with user's questions

                                /* Preparing answers for current question (answers located only in raw source questions). */
                                for (var possibleAnswerID in usersPassedQuestion['answers']) {
                                    checkedAnswersToInsert.push({
                                        question_id: insertedQuestions[iqPointer].id,
                                        text: usersPassedQuestion['answers'][possibleAnswerID],
                                        createdAt: new Date(),
                                        updatedAt: new Date()
                                    });
                                }
                            }

                            /* And making multiple insert with the same params. */
                            return models.possible_answer.bulkCreate(checkedAnswersToInsert, { transaction: t, returning: true });
                        })
                });

            /* Here we are approaching two possible results of our big transaction. */
        }).then(function(result) { // if everything is ok
            /* Must escape to protect from XSS. */
            var escape = require('escape-html'); // importing module for that
            callback({ id: createdFormID, name: escape(name), stages: 0}); // obviously we don't have feedback stages yet
        }).catch(function(error) { // if something went wrong or source data was invalid
            callback(null)
        });
}

/**
 * Adds stage with its disciplines.
 * @param {Array} body Contents of future stage.
 * @param {Function} callback Pass null to it to throw error and return created stage as json to signal about success (see the format in frontend).
 * */
function addStage(body, callback) {
    /* Getting and checking dates fields. */
    var dateFrom = new Date(body['date_from']);
    var dateTo   = new Date(body['date_to']);
    var currentDate = new Date();
    // Checking dates' validity
    if (dateFrom >= dateTo || dateFrom <= currentDate || dateTo <= currentDate) {
        callback(null);
        return;
    }

    // /* Checking that disciplines array is not empty. */
    // var disciplines = body['disciplines'];
    // if (!Array.isArray(disciplines) || disciplines.length == 0) {
    //     callback(null);
    //     return;
    // }

    /* Setting feedback form field to var. */
    var feedbackFormId = body['feedback_form_id'];

    /* DATA PREPARATIONS COMPLETED, BEGINNING DB INSERT TRANSACTION */


    /* Preparing vars to store some db transaction intermediate results. */
    var createdStageId = null;
    var createdStageDescriptions = null;
    var usedFeedbackFormName = null;

    /* Beginning transaction (because it's impossible to add a stage without disciplines). */
    models.sequelize.transaction(
        { autocommit: false }, // transactions don't work without this param
        function(t) {

            /* Creating feedback stage first */
            return models.feedback_stage.create({
                date_from:        dateFrom,
                date_to:          dateTo,
                feedback_form_id: feedbackFormId,
                createdAt:        new Date(),
                updatedAt:        new Date()
            }, { transaction: t })

                // /* When feedback stage was created, inserting disciplines for it. */
                // .then(function(feedback_stage) {
                //     createdStageId = feedback_stage.id;
                //     // We should populate raw disciplines with such dates for successful insertion.
                //     for (var i = 0; i < disciplines.length; i++) {
                //         disciplines[i]['createdAt'] = new Date();
                //         disciplines[i]['updatedAt'] = new Date();
                //     }
                //     // Inserting all disciplines for stage in database.
                //     return models.discipline.bulkCreate(disciplines,
                //         { transaction: t, returning: true }) // must provide returning param to create IDs
                //
                //         .then(function(disciplines) {
                //             // Creating stage description for every created disciplines. Preparing array first.
                //             var stageDescriptions = [];
                //             for (var i = 0; i < disciplines.length; i++) {
                //                 stageDescriptions.push({
                //                     discipline_id:     disciplines[i].id,
                //                     feedback_stage_id: feedback_stage.id,
                //                     createdAt:         new Date(),
                //                     updatedAt:         new Date()
                //                 })
                //             }
                //             // Inserting stage descriptions in database
                //             return models.stage_description.bulkCreate(stageDescriptions,
                //                 { transaction: t, returning: true }) // to create IDs
                //
                //                 .then(function(stage_descriptions) {


                .then(function (fs) {
                    createdStageId = fs.id;


                                    // // Not very perfect move, but we must return stage descriptions with disciplines to frontend.
                                    // return models.stage_description.findAll({
                                    //     where: { feedback_stage_id: createdStageId },        // only for created feedback stage
                                    //     attributes: ['discipline_id'],
                                    //     include: [
                                    //         {
                                    //             // Including disciplines.
                                    //             attributes: { exclude: ['createdAt', 'updatedAt'] },
                                    //             model: models.discipline,
                                    //             include: [
                                    //                 {
                                    //                     attributes: { exclude: ['createdAt', 'updatedAt'] },
                                    //                     model: models.subject
                                    //                 },
                                    //                 {
                                    //                     attributes: { exclude: ['createdAt', 'updatedAt'] },
                                    //                     model: models.teacher
                                    //                 },
                                    //                 {
                                    //                     attributes: { exclude: ['createdAt', 'updatedAt'] },
                                    //                     model: models.group
                                    //                 }
                                    //             ]
                                    //         }
                                    //     ]
                                    //
                                    //     , transaction: t})
                                    //
                                    //     .then(function(stage_descriptions) {
                                    //         // Stopping if something wrong while getting stage descriptions.
                                    //         if (stage_descriptions == null) {
                                    //             callback(null);
                                    //             return;
                                    //         }
                                    //         // Converting db response to usual JS array.
                                    //         stage_descriptions = utilsController.toNormalArray(stage_descriptions);
                                    //
                                    //         // To refer it from out the db interactions.
                                    //         createdStageDescriptions = stage_descriptions;








                                            // Looking for name for passed to this method form (by ID).
                                            return models.feedback_form.findOne({
                                                    where: { id: feedbackFormId },
                                                    attributes: ['name'],
                                                    transaction: t
                                                })

                                                    .then(function(feedback_form) {
                                                    // If data about form is valid
                                                    if (feedback_form != null) {
                                                        usedFeedbackFormName = feedback_form.name; // saving for next read
                                                    } else {
                                                        callback(null);
                                                    }
                                                });
                                        // })
                                })  ;


                //         })
                // });

        /* If everything is ok in our big transaction. */
        }).then(function(result) {
            // Every data was modified, so XSSs are impossible.
            callback({
                id:                createdStageId,
                dateFrom:          dateFrom,
                dateTo:            dateTo,
                formName:          usedFeedbackFormName
                // stageDescriptions: createdStageDescriptions
            });
        }).catch(function(error) {
            // If something went wrong or source data was invalid.
            callback(null)
        });

}



/* SUPPORT FUNCTIONS (PRIVATE) */

/* Renders error with description. */
function renderError(res, description) {
    res.render('error', {
        message: description,
        error: {}
    });
}

/**
 * Prepares JS date for html min and max appropriate values.
 * @param {Date} srcDate A Date to format.
 * @returns {String} Formatted date string.
 * */
function formatDateForHtml(srcDate) {
    // To make a proper month or day format (e.g. 01).
    function addZero(number) {
        if (number <= 9)
            return '0' + number;
        return number;
    }

    /* Date will look like: 2015-02-22 */
    return srcDate.getFullYear() + '-'
        + addZero((srcDate.getMonth() + 1)) + '-'
        + addZero(srcDate.getDate());
}