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
    },

    /**
     * Adds or deletes loader in container depending on boolean flag.
     * @param {Object} container A container where to show or hide loader.
     * @param {Boolean} show Flag to add or delete loader.
     * */
    showLoader : function(container, show) {
        if (show) {
            // Appending a loader for stated container.
            container.prepend('<div class="loader center"><div class="preloader-wrapper big active">' + // big size
                '<div class="spinner-layer spinner-blue-only">' + // color specification
                '<div class="circle-clipper left">' +
                '<div class="circle"></div>' +
                '</div><div class="gap-patch">' +
                '<div class="circle"></div>' +
                '</div><div class="circle-clipper right">' +
                '<div class="circle"></div>' +
                '</div></div></div></div>');
        } else
            // Removing all loaders in a stated container.
            container.find('.loader').remove();
    }

};