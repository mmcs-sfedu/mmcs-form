/* Called when page was loaded. */
$(document).ready(function() {

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
     * @param {Array} disciplines An array of discipline used for that stage.
     * */
    appendStageToStagesList: function(node, id, dateFrom, dateTo, formName, disciplines) {


        //li.collection-item
        //    div Дата проведения: с 21.12.93 по 12.11.94
        //        br
        //        span Используется форма Форма-1
        //        br
        //        span Для дисциплин:
        //        br
        //        span Машинное обучение (Гуда С.А.) в группе ММ-1 ,
        //        a(href='#!' class='secondary-content')
        //            i(id='1' class='material-icons red-text text-lighten-3') delete


        /* First part of form element. */
        var stageItemHtml = '' +
            '<li class="collection-item">' +
            '<div>' + formName;                                                      // form's name

//        /* Adding stages count label, if we have some. */
//        if (stages != 0) {
//            stageItemHtml = stageItemHtml +
//                '<br>(используется в опросах: ' + stages + ')';                  // showing stages count
//        }
//
//        /* If form doesn't have stages, adding delete button for it. */
//        if (stages == 0) {
//            stageItemHtml = stageItemHtml +
//                '<a href="#!"' +
//                ' class="secondary-content">' +
//                '<i id="' + id +                                                 // form's id to delete it
//                '" class="material-icons red-text text-lighten-3">delete</i>' +  // delete icon (if has no stages)
//                '</a>'
//        }
//
//        /* Closing form block. */
//        stageItemHtml = stageItemHtml +
//            '</div>' +
//            '</li>';



        node.append(stageItemHtml);
    }

};