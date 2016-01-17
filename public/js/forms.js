/* Called when page was loaded. */
$(document).ready(function() {

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
        return('' +
            '<li class="collection-item">' +
            '<div>' + name +                       // form's name
            '<a href="http://google.com"' +        // delete form url (if has no stages)
            ' class="secondary-content">' +
            '<i class="material-icons">send</i>' + // delete icon (if has no stages)
            '</a>' +
            '</div>' +
            '</li>')
    }
};