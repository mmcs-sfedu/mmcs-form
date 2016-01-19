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
    },

    /**
     * Creates an object from Jade parse string.
     * @param {String} source Jade object after JSON.stringify.
     * @returns {Object} Parsed JS object.
     * */
    parseObjectFromJadeStringified: function(source) {
        // Replacing quote symbol on normal everywhere using regexp.
        source = source.replace(/&quot;/g, '"');
        // Parsing to object.
        source = JSON.parse(source);

        return source;
    }

};