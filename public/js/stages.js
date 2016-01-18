/* Called when page was loaded. */
$(document).ready(function() {
    // $.getScript("/js/utils.js"); // async import script
});

/* Namespace for stages scripts. */
var stages = {

    /**
     * Appends stage item with description to collection list.
     * @param {Object} node A collection object where to add item.
     * @param {Number} id Stage's ID (needed for further delete).
     * @param {Date} dateFrom The date of stage's beginning.
     * @param {Date} dateTo The date of stage's ending.
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
        stageItemHtml = stageItemHtml + '<br>Используется форма <i>' + formName + '</i>';


        /* Disciplines start block. */
        stageItemHtml = stageItemHtml + '<br>Для дисциплин: <i>';

        /* Adding disciplines descriptions. */
        for (var stageDescriptionIndex in stageDescriptions) {
            var stageDescription = stageDescriptions[stageDescriptionIndex];
            var discipline = stageDescription['discipline'];
            stageItemHtml += '<br>&nbsp&nbsp&nbsp&nbsp&nbsp' + discipline['subject']
                + ' (' + discipline['teacher'] + ') '
                + 'в группе ' + discipline['group'];
        }

        /* Discipline end block. */
        stageItemHtml = stageItemHtml + '</i>';


        /* Adding delete button. */
        stageItemHtml += '' +
            '<a href="#!" class="secondary-content">' +
            '<i id="' + id + '" class="material-icons red-text text-lighten-3">delete</i>' +
            '</a>';


        /* Closing stage block. */
        stageItemHtml = stageItemHtml +
            '</div>' +
            '</li>';


        // TODO ДОБАВИТЬ СЛУШАТЕЛЬ ДЛЯ КНОПКИ УДАЛЕНИЯ - ПОКАЗЫВАТЬ ДИАЛОГ С УВЕДОМЛЕНИЕМ!


        /* And finally adding row to list. */
        node.append(stageItemHtml);
    }

};