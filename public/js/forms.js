/* Called when page was loaded. */
$(document).ready(function() {
    /* Setting onclick listeners for forms list. */
    forms.updateDeleteButtonsListeners();

    /* Setting onclick listener for add question button. */
    $('a#addQuestion').on('click', forms.addQuestion);

    /* Setting submit questions button onclick listener. */
    $('a#submitQuestions').on('click', forms.submitQuestions);

    /* Turning on dialog windows. */
    $('.modal-trigger').leanModal();
});

/* Namespace for forms scripts. */
var forms = {
    /**
     * Sets onclick listeners for all appropriate delete buttons on the screen.
     * */
    updateDeleteButtonsListeners: function() {
        $("li.collection-item a.secondary-content i").on('click', forms.deleteForm);
    },

    /**
     * Creates html code for forms list item depending on it's type.
     * @param {Number} id Form's ID.
     * @param {String} name Form's title.
     * @param {Number} stages Number of form's stages.
     * @returns {String} An HTML code of created list element.
     * */
    generateFormsListItem: function(id, name, stages) {
        /* First part of form element. */
        var formHtml = '' +
            '<li class="collection-item">' +
            '<div>' + name;                                                      // form's name

        /* Adding stages count label, if we have some. */
        if (stages != 0) {
            formHtml = formHtml +
                '<br>(используется в опросах: ' + stages + ')';                  // showing stages count
        }

        /* If form doesn't have stages, adding delete button for it. */
        if (stages == 0) {
            formHtml = formHtml +
                '<a href="#!"' +
                ' class="secondary-content">' +
                '<i id="' + id +                                                 // form's id to delete it
                '" class="material-icons red-text text-lighten-3">delete</i>' +  // delete icon (if has no stages)
                '</a>'
        }

        /* Closing form block. */
        formHtml = formHtml +
            '</div>' +
            '</li>';

        return formHtml;
    },

    /**
     * Deletes chosen form.
     * */
    deleteForm: function() {
        /* Getting form id. */
        var form = $(this);
        var formID = form.attr('id');

        /* Describing delete request for form. */
        var request = $.ajax({
            url: '/maintaining/form',
            method: 'DELETE',
            data: { id : formID },
            dataType: "json"
        });
        /* Deleting form from list, if everything is ok. */
        request.done(function(response) {
            form.parents('li.collection-item').first().remove();
        });
        /* Showing an error in another case. */
        request.fail(function(jqXHR, textStatus) {
            Materialize.toast('Не удалось удалить форму ' + formID, 5000)
        });
    },

    /* Some counters to avoid intersections. */
    questionsCounter: 0,
    answersCounter:   0,

    /**
     * Adds a question to form.
     * */
    addQuestion: function() {
        /* A div where to add question fields. */
        var questionsBlock = $(".questions");

        /* Increasing count (id) of questions. */
        forms.questionsCounter++;

        /* Creating question row. */
        var questionRow = '' +
            // Adding also some top brs.
            '<div class="w-90 margin-to-right"><br><br>' +
            // Enter question name field.
            '<div class="input-field">' +
            // Delete question button.
            '<i onclick="parentNode.parentNode.remove();" class="material-icons red-text text-lighten-3 pointer prefix">delete</i>' +
            '<input id="question_'  + forms.questionsCounter + '" type="text" class="validate question" autocomplete="off">' +
            '<label for="question_' + forms.questionsCounter + '">Текст вопроса</label>' +
            '</div>' +
            // Answers block.
            '<div class="answers w-90 margin-to-right"></div>' +
            // Add answer button.
            '<a href="#!" class="add-answer">' +
            '<i class="material-icons green-text text-lighten-3">add</i>' +
            '<span class="green-text text-lighten-3">Добавить ответ</span>' +
            '</a>' +
            '</div>';

        /* Setting listener for add answer button. */
        questionRow = $($.parseHTML(questionRow)); // to convert text to jQuery object
        questionRow.find('a.add-answer').on('click', function() {
            /* Block with all answers. */
            var answersBlock = questionRow.find('div.answers');

            /* Increasing count (id) of answers. */
            forms.answersCounter++;

            /* Field for possible answer. */
            var possibleAnswer = '' +
                // Field for answer label.
                '<div class="input-field">' +
                // Delete answer button.
                '<i onclick="parentNode.remove();" class="material-icons red-text text-lighten-3 pointer prefix">delete</i>' +
                '<input id="possible_answer_'  + forms.questionsCounter + '_' + forms.answersCounter + '"' +
                ' type="text" class="validate" autocomplete="off">' +
                '<label for="possible_answer_' + forms.questionsCounter + '_' + forms.answersCounter + '">Возможный ответ</label>' +
                '</div>';

            /* Adding possible answer field. */
            answersBlock.append(possibleAnswer);
        });

        /* Adding question field. */
        questionsBlock.append(questionRow);
    },

    /**
     * Checks fields and submits new form.
     * */
    submitQuestions: function() {
        /* Request JSON. */
        var requestBody = {};
        requestBody["questions"] = {}; // init questions field

        /* Checking if form name is not empty. */
        var formName = $('div.input-field input#name').val();
        if (formName.length == 0) {
            Materialize.toast('Укажите название формы!', 5000);
            return;
        } else {
            /** Adding form name to request. */
            requestBody["name"] = formName;
        }

        /* A div containing all questions. */
        var questionsBlock = $('div.questions');

        /* Checking if forms has no answers. */
        if (questionsBlock.children().length == 0) {
            Materialize.toast('Добавьте хотя бы один вопрос для формы!', 5000);
            return;
        }

        /* Checking if all fields are not empty. */
        var allFieldsStated = true; // to check if all fields are named
        questionsBlock.children().each(function() {
            // Current observable question row.
            var currentQuestionRow = $(this);

            // If current question doesn't have any answers.
            if (currentQuestionRow.find('.answers').children().length == 0) {
                // Then stopping each and leaving with next error.
                allFieldsStated = false;
                return allFieldsStated;
            }

            // Looking for every input.
            currentQuestionRow.find('input').each(function() {
                var input = $(this);
                if (input.val() == 0) { // an input wasn't filled
                    allFieldsStated = false;
                    return allFieldsStated;
                } else {

                    /** Adding field to request. */
                    // Question was encountered.
                    if (input.hasClass('question')) {
                        // Adding question in request array.
                        requestBody
                            ["questions"]
                            [input.attr('id')] = { text: input.val(), answers: [] };
                    // Answer was encountered.
                    } else {
                        // Adding answer for parent question node in request array.
                        requestBody
                            ["questions"]
                            [currentQuestionRow.find('input.question').attr('id')]
                            ["answers"].push(input.val());
                    }

                }
            });

            if (!allFieldsStated) {
                return false; // return from each: some fields are not stated
            }
        });

        // If some inputs weren't filled or questions don't have answers, showing an error.
        if (!allFieldsStated) {
            Materialize.toast('Некоторые поля остались незаполненными или вопросам не добавлены ответы!', 5000);
            return;
        }

        /* END OF FORMS CHECK */


        /* Binding UI elements. */
        var buttonsFooter = $('#addForm .modal-footer');
        var btnSubmit = buttonsFooter.find('#submitQuestions');
        var btnCancel = buttonsFooter.find('#cancelForm');

        /* Describing add form request. */
        var request = $.ajax({
            url: '/maintaining/form',
            method: 'POST',
            data: JSON.stringify(requestBody), // string will be parsed into json
            dataType: 'json',                  // you must specify these type params to make NodeJS read query
            contentType: 'application/json'
        });
        /* If everything is ok. */
        request.done(function(response) {
            // Adding new form to list.
            try {
                $(".collection").append(forms.generateFormsListItem(response.id, response.name, response.stages));
                forms.updateDeleteButtonsListeners(); // adding onclick listener for new form item
                btnCancel.click(); // closing dialog
                Materialize.toast('Форма успешно добавлена', 5000);
            } catch (exc) {
                proceedFail();
            }
        });
        /* In another case. */
        request.fail(function(jqXHR, textStatus) {
            proceedFail();
        });
        /* A function to proceed fail. */
        function proceedFail() {
            Materialize.toast('Не удалось создать форму', 5000);
        }
    }
};