/* Called when page was loaded. */
$(document).ready(function() {
    /* Setting onclick listeners for forms list. */
    $("li.collection-item a.secondary-content i").on('click', forms.deleteForm);

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
    }
};