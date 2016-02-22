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
        survey.makeHeaderFixedAndAddNav();
    },

    /**
     * Prepares auth header for chosen survey section.
     * */
    makeHeaderFixedAndAddNav : function() {
        // Getting link to header
        var authHeader = $('.student-auth-context');

        // Making header fixed
        authHeader.addClass('fixed-header');

        // Adding back button for header
        authHeader.find('.left-nav').html('<a class="white-text" href="/survey">← К выбору опроса</a>');


        // Adding true spacing for container (to fit auth header)
        $('.container.survey-index-context').css('margin-top', authHeader.height());
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