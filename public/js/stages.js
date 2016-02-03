/* Called when page was loaded. */
$(document).ready(function() {
    stages.init();
});

/* Namespace for stages scripts. */
var stages = {
    // Namespace for DOM to avoid intersections.
    context : null,

    /**
     * Fires when page was loaded.
     * */
    init: function() {
        /* Setting context. */
        stages.context = $('.maintaining-schedule-context');

        /* Setting on text changed listener for search request input. */
        stages.context.find('#disciplineSearch').on('input', stages.onSearchRequestChanged);

        /* Setting submit stage button onclick listener. */
        stages.context.find('#submitStage').on('click', stages.submitStage);

        /* Firing material selects transformation. */
        stages.context.find('select').material_select();
    },

    /**
     * Appends stage item with description to collection list.
     * @param {Object} node A collection object where to add item.
     * @param {String} id Stage's ID (needed for further delete).
     * @param {String} dateFrom The date of stage's beginning.
     * @param {String} dateTo The date of stage's ending.
     * @param {String} formName Used form in that stage.
     * @param {Array} stageDescriptions An array of discipline used for that stage.
     * */
    appendStageToStagesList: function(node, id, dateFrom, dateTo, formName, stageDescriptions) {
        /* First part of stage element. */
        var stageItemHtml = '' +
            '<li class="collection-item">' +
            // Date row.
            '<div>Дата проведения: <b>с ' + utils.formatDateForStage(dateFrom) + ' по ' + utils.formatDateForStage(dateTo) + '</b>';

        /* Used form row. */
        stageItemHtml += '<br>Используется форма <i>' + formName + '</i>';


        /* Disciplines start block. */
        stageItemHtml += '<br>Для дисциплин: <i>';

        /* Adding disciplines descriptions. */
        for (var i = 0; i < stageDescriptions.length; i++) {
            var stageDescription = stageDescriptions[i];
            var discipline = stageDescription['discipline'];
            stageItemHtml += '<br>&nbsp&nbsp&nbsp&nbsp&nbsp' + discipline['subject']
                + ' (' + discipline['teacher'] + ') '
                + 'в группе ' + discipline['group'];
        }

        /* Discipline end block. */
        stageItemHtml += '</i>';


        /* Adding delete button. */
        stageItemHtml += '' +
            // This button will show deletion prompt first in modal dialog.
            '<a href="#deleteStage" class="secondary-content modal-trigger">' +
            '<i id="' + id + '" class="delete-stage-icon material-icons red-text text-lighten-3">delete</i>' +
            '</a>';


        /* Closing stage block. */
        stageItemHtml = stageItemHtml +
            '</div>' +
            '</li>';


        /* Converting html code to object to add listener for button. */
        stageItemHtml = $($.parseHTML(stageItemHtml));

        // Adding onclick listener.
        stageItemHtml.find('i#' + id).on('click', stages.prepareDeletionModal);


        /* And finally adding row to list. */
        node.append(stageItemHtml);
    },

    /**
     * Initiates modal deletion dialog buttons actions.
     * */
    prepareDeletionModal: function() {
        /* Getting stage ID which will be deleted. */
        var stageIdToDelete = $(this).attr('id');

        /* Getting UI button to set onclick listener. */
        var btnSubmit = stages.context.find('.modal #submitDeletion');

        /* Onclick deletion listener. */
        btnSubmit.off('click'); // removing old listeners first
        btnSubmit.on('click', function() { stages.deleteStage(stageIdToDelete) });
    },

    /**
     * Deletes chosen stage.
     * */
    deleteStage: function(stageID) {
        /* Describing delete request for stage. */
        var request = $.ajax({
            url: '/maintaining/stage',
            method: 'DELETE',
            data: { id : stageID },
            dataType: "json"
        });
        /* Deleting stage from list, if everything is ok. */
        request.done(function(response) {
            stages.context.find('.modal#deleteStage').closeModal(); // closing dialog
            stages.context.find('i.delete-stage-icon#' + stageID).parents('.collection-item').first().remove(); // deleting stage from DOM
        });
        /* Showing an error in another case. */
        request.fail(function(jqXHR, textStatus) {
            Materialize.toast('Не удалось удалить опрос ' + stageID, 5000)
        });
    },

    /**
     * Analyzes search query and hides wrong list items.
     * */
    onSearchRequestChanged: function() {
        /* What user has typed in search field. */
        var searchQuery =  $(this).val();

        /* Default divider symbol. */
        var divider = ';';

        /* Block with all disciplines. */
        var items = stages.context.find('.collection.disciplines .collection-item');

        /* If some dividers found. */
        if (searchQuery.indexOf(divider) != -1) {
            checkItems(searchQuery.split(divider));
        } else {
            checkItems([searchQuery]);
        }

        /**
         * Checks if in list items values found some queries.
         * @param {Array} substrings Must contain at least one substring to compare.
         * */
        function checkItems(substrings) {
            items.each(function() {                           // loop throw all items
                for (var i = 0; i < substrings.length; i++) { // loop throw all substrings
                    if (substrings[i].length == 0) // because it's bad idea to compare empty strings
                        continue;

                    if ($(this).text().toLowerCase().indexOf(substrings[i].toLowerCase()) != -1) {
                        // Found substring in item, no need to check all other substrings.
                        $(this).removeClass('hide');
                        break;
                    } else {
                        // Hiding item, if it doesn't have any match
                        $(this).addClass('hide');
                    }
                }
            })
        }
    },

    /**
     * Checks all prepared data for stage and submits it on server.
     * */
    submitStage: function() {
        /* Getting and checking dates. */
        var dateFrom = stages.context.find('#dateFrom').val();
        var dateTo   = stages.context.find('#dateTo').val();
        // Dates must be filled.
        if (dateFrom.length == 0) {
            Materialize.toast('Укажите правильную дату начала опроса', 5000);
            return;
        }
        if (dateTo.length == 0) {
            Materialize.toast('Укажите правильную дату завершения опроса', 5000);
            return;
        }
        // Preparing dates: setting current hours and minutes.
        var currentDate = new Date();
        dateFrom = new Date(dateFrom); dateFrom.setHours(currentDate.getHours()); dateFrom.setMinutes(currentDate.getMinutes() + 5); // or we won't be able to add today's date
        dateTo   = new Date(dateTo);   dateTo.setHours(currentDate.getHours());   dateTo.setMinutes(currentDate.getMinutes());
        // Dates to timestamp.
        dateFrom = dateFrom.getTime();
        dateTo   = dateTo.getTime();
        if (dateFrom >= dateTo) {
            Materialize.toast('Дата начала опроса не может быть больше даты завершения', 5000);
            return;
        }


        /* Getting chosen form ID. */
        var feedbackFormId = stages.context.find('select.forms').val();

        /* Getting chosen disciplines data. */
        var disciplinesList = stages.context.find('.collection.disciplines');
        /* Getting all chosen disciplines. */
        var disciplinesItems = disciplinesList.children().not('.hide');
        if (disciplinesItems.length == 0) { // checking if user chose something
            Materialize.toast('Выберите по меньшей мере одну дисциплину', 5000);
            return;
        }
        /* Walking throw all chosen disciplines to prepare request array. */
        var disciplines = [];
        disciplinesItems.each(function() {
            disciplines.push({
                teacher_id: $(this).attr('teacherID'),
                subject_id: $(this).attr('subjectID'),
                group_id:   $(this).attr('groupID')
            });
        });

        /* ALL DATA VALIDATED AND PREPARED */



        /* Binding UI elements. */
        var buttonsFooter = stages.context.find('#addStage .modal-footer');
        var btnCancel = buttonsFooter.find('#cancelStage');

        /* SENDING DATA ASYNC */

        /* Describing add stage request. */
        var request = $.ajax({
            url: '/maintaining/stage',
            method: 'POST',
            data: JSON.stringify({             // string will be parsed into json
                date_from        : dateFrom,
                date_to          : dateTo,
                feedback_form_id : feedbackFormId,
                disciplines      : disciplines
            }),
            dataType: 'json',                  // you must specify these type params to make NodeJS read query
            contentType: 'application/json'
        });
        /* If everything is ok. */
        request.done(function(response) {
            // Adding new stage to list.
            try {
                stages.appendStageToStagesList(
                    stages.context.find(".collection.stages"),
                    response.id,
                    response.dateFrom,
                    response.dateTo,
                    response.formName,
                    response.stageDescriptions);
                stages.context.find('.modal#addStage').closeModal(); // closing dialog
                Materialize.toast('Опрос успешно добавлен', 5000);
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
            Materialize.toast('Не удалось создать опрос', 5000);
        }
    }

};