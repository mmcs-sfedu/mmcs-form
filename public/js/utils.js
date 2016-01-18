/** This is a script with some common functions. */

/* Namespace for utils functions. */
var utils = {

    /**
     * Formats date properly.
     * @param {String} dateString Source date string.
     * @returns {String} Formatted date.
     * */
    formatDateForStage: function(dateString) {
        var date = new Date(dateString);

        return ''
            + date.getDate() + '.'
            + (date.getMonth() + 1) + '.'
            + date.getFullYear() + '-'
            + date.getHours() + ':'
            + date.getMinutes();
    }

};