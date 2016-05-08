// called when document is rendered
$(document).ready(function() {
    survey.init(); // initializing page
});

// using namespace main
var survey = {

    context : null, // to make namespace for jQuery (DOM)


    /**
     * Runs when page first time loaded - prepares all DOM and listeners
     * */
    init : function() {
        // Setting context
        survey.context = $('.survey-index-context');

        // Preparing header for survey.
        main.makeHeaderFixedAndAddNav('.student-auth-context', '← К выбору опроса',
                                      survey.goBack, '.container.survey-index-context');
    },

    /**
     * Checks forms' filling: if some of them filled - showing a prompt about that.
     * If there is no checked forms - redirecting back.
     * */
    goBack : function() {
        // Looking for all survey forms.
        var surveyForms = survey.context.find('.survey-form');

        // Flag to check if some forms are filled.
        var someFormsChecked = false;
        surveyForms.each(function() {
            // Checking if some forms has checked answers.
            var checkedAnswers = $(this).find(':checked');
            if (checkedAnswers.size() != 0) {
                someFormsChecked = true; // found at least one checked answer
                return false; // returning from foreach
            }
        });

        // If some answers are checked - showing a prompt about it.
        if (someFormsChecked) {
            survey.context.find('.modal#back-prompt-dialog').openModal();
        // Redirecting back vice versa.
        } else {
            window.location.href = '/survey';
        }
    },


    /**
     * Checks if all forms are filled.
     * @returns {Object} False if some questions were not answered (also shows toast) or checked answers IDs if everything was answered.
     * */
    checkForms : function() {
        // Looking for all survey forms.
        var surveyForms = survey.context.find('.survey-form');

        // Flag to check if everything was answered.
        var allChecked = true;

        // If something went wrong and there are no any forms.
        if (surveyForms.size() === 0)
            return false;

        // Here will be all checked answers.
        var checkedAnswersIds = [];

        // Iterating throw all forms and checking them.
        surveyForms.each(function() {
            // Contains all checked checkboxes.
            var checkedAnswers = $(this).find(':checked');
            // If there are at least one form without answer.
            if (checkedAnswers.size() === 0) {
                allChecked = false;
                return false; // returning from foreach
            }

            // Getting all answers IDs.
            checkedAnswers.each(function() {
                checkedAnswersIds.push($(this).attr('id'));
            });
        });


        // If all questions are answered.
        if (allChecked) {
            return checkedAnswersIds;
        } else {
            // If some questions have no answer - toasting about that.
            Materialize.toast('Вы не ответили на все вопросы!', 5000)
        }

        return false;
    },

    /**
     * Opens confirmation dialog if all answers are provided.
     * */
    openConfirmation : function() {
        if (survey.checkForms()) {
            survey.context.find('.modal#confirm-dialog').openModal();
        }
    },

    /**
     * If all answers are stated - submitting them on server.
     * @param {Number} chosenStageDescriptionID A stage's ID to submit answers.
     * */
    submitAnswersRequest : function(chosenStageDescriptionID) {
        // Answers if all stated or false and toast in another case.
        var answers = survey.checkForms();

        // If everything is ok - submitting answers by POST.
        if (answers) {
            var redirectUrl = '/survey/finish';
            $.redirectPost(redirectUrl, {
                stage_description_id : chosenStageDescriptionID,
                possible_answers     : answers
            });
        } else {
            // Closing modal dialog with confirmation in another case.
            survey.context.find('.modal#confirm-dialog').closeModal();
        }
    }

};