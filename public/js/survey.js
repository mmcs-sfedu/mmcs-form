// called when document is rendered
$(document).ready(function() {
    survey.init(); // initializing page
});

// using namespace main
var survey = {
    context : null, // to make namespace for jQuery (DOM)


    all_selects : null, // here will be all DOM select elements in a context


    chosenStageDescription : null, // to store chosen description ID


    /**
     * Runs when page first time loaded - prepares all DOM and listeners
     * */
    init : function() {
        // Setting context
        survey.context = $('.survey-index-context');

        // Making selects material
        survey.all_selects = survey.context.find('select');
        survey.all_selects.material_select();


        // Setting onclick listener for discipline chooser (we have only one select here)
        survey.context.find('div.select-wrapper li').on('click', survey.onSelectClickListener);
    },


    /**
     * When onclick listener of discipline chooser has triggered. Requests forms for survey.
     * */
    onSelectClickListener : function() {
        // Getting value of chosen select
        var chosenID = survey.context.find('#disciplines').first().val();

        // If chosen something excepting disabled
        if (chosenID) {
            // Requesting survey forms for chosen select
            survey.chosenStageDescription = chosenID;
            survey.requestForms();
        }
    },

    /**
     * Async requesting forms from server.
     * */
    requestForms : function() {
        // Fragment where to add forms and show loader.
        var formsListBlock = survey.context.find('.forms-list').first();

        // Clearing old forms first.
        formsListBlock.html('');

        // Showing loader while request is in progress.
        utils.showLoader(formsListBlock, true);

        // Describing request to get forms.
        var request = $.ajax({
            url: '/survey/forms',
            method: 'GET',
            data: { stage_description_id : survey.chosenStageDescription },
            dataType: "json"
        });
        // If everything is ok - hiding loader and rendering forms.
        request.done(function(response) {
            utils.showLoader(formsListBlock, false);
            survey.renderForm(response);
        });
        // If something went wrong - showing an error
        request.fail(function(jqXHR, textStatus) {
            utils.showLoader(formsListBlock, false);
            Materialize.toast('Произошла ошибка получения вопросов анкетирования', 5000)
        });
    },

    /**
     * Renders chosen form.
     * @param {Object} form A JS object with form's questions.
     * */
    renderForm : function(form) {
        // Fragment where to add forms.
        var formsListBlock = survey.context.find('.forms-list').first();


        // Iterating throw all questions to add them into the form.
        form.questions.forEach(function(question) {

            // Here will be answers for current question.
            var possibleAnswers = '';
            question.possible_answers.forEach(function(possibleAnswer) {
                possibleAnswers = possibleAnswers + '' +
                    // IDs must be different to avoid bugs with checkboxes.
                    '<p><input type="radio" name="' + question.id + '" id="' + possibleAnswer.id + '">' +
                    // Label for checkbox (by ID).
                    '<label class="white-text" for="' + possibleAnswer.id + '">' + possibleAnswer.text + '</label></p>';
            });

            // Adding question to the form block.
            formsListBlock.append(
                '<div class="row"><div class="col l8 m10 s12"><div class="card-panel blue">' + // question panel style
                '<span class="white-text"><h5>' + question.text + '</h5><br>' + // question's text and style
                '<form action="#" class="survey-form">' + // form with possible answers
                '' + possibleAnswers +
                '</form>' +
                '</span>' +
                '</div></div></div>');
        });

        /* END OF QUESTIONS BLOCK */


        // Appending confirmation buttons and dialog.
        formsListBlock.append(
                '<br>' +
                // Confirmation button.
                '<a id="confirmation" class="btn-large waves-effect waves-light red lighten-2" onclick="survey.openConfirmation();">Отправить</a>' +
                // Confirmation dialog view.
                '<div id="confirm-dialog" class="modal"><div class="modal-content">' +
                // Dialog header.
                '<h4>Вы подтверждаете отправку ответов?</h4>' +
                // Dialog text.
                '<p>После подтверждения отправки изменить ответы будет уже невозможно</p>' +
                '</div>' +
                // Dialogs action buttons.
                '<div class="modal-footer">' +
                '<a href="#!" class="modal-action modal-close waves-effect waves-teal btn-flat">Нет</a>' +
                '<a href="#!" class="modal-action modal-close waves-effect waves-teal btn-flat" onclick="survey.submitAnswersRequest();">Да</a>' +
                '</div></div>');
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
     * */
    submitAnswersRequest : function() {
        // Answers if all stated or false and toast in another case.
        var answers = survey.checkForms();

        // If everything is ok - submitting answers by POST.
        if (answers) {
            var redirectUrl = '/survey/finish';
            $.redirectPost(redirectUrl, {
                stage_description_id : survey.chosenStageDescription,
                possible_answers     : answers
            });
        } else {
            // Closing modal dialog with confirmation in another case.
            survey.context.find('.modal#confirm-dialog').closeModal();
        }
    }

};