/* Called when page was loaded. */
$(document).ready(function() {
    /* Setting onclick listeners for forms list. */
    $("li.collection-item a.secondary-content i").on('click', forms.deleteForm);

    /* Setting onclick listener for add question button. */
    $('a#addQuestion').on('click', forms.addQuestion);

    $('a#submitQuestions').on('click', forms.submitQuestions);

    /* Turning on dialog windows. */
    $('.modal-trigger').leanModal();
});

/* Namespace for forms scripts. */
var forms = {
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
     * Deletes chosen form. */
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
            form.parent().parent().parent().remove();
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
            '<input id="question_' + forms.questionsCounter + '" type="text" class="validate" autocomplete="off">' +
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
                '<input id="possible_answer_' + forms.questionsCounter + '_' + forms.answersCounter + '"' +
                ' type="text" class="validate" autocomplete="off">' +
                '<label for="possible_answer_' + forms.questionsCounter + '_' + forms.answersCounter + '">Возможный ответ</label>' +
                '</div>';

            /* Adding possible answer field. */
            answersBlock.append(possibleAnswer);
        });

        /* Adding question field. */
        questionsBlock.append(questionRow);
    },

    submitQuestions: function() {
        alert("submitted!");
    }
};