/* Called when page was loaded. */
$(document).ready(function() {
    // Making all default configurations.
    results.init();
});

/* Namespace for results functions. */
var results = {
    /** Namespace for DOM to avoid intersections. */
    context : null,

    /**
     * Function to be executed to make all pre-configs for this page.
     * */
    init : function() {
        // Binding context.
        results.context = $('.maintaining-results-context');

        /* Adding back button. */
        main.makeHeaderFixedAndAddNav('.admin-auth-context', '← К разделам',
            function () { window.location.href = '/maintaining'; }, '.container.maintaining-results-context');

        // Adding listeners to download results.
        results.addDownloadButtonsListeners();
    },


    /**
     * Looks for all download buttons and applies corresponding listeners for them.
     * */
    addDownloadButtonsListeners : function() {
        // Applying listeners with default prevents to download results.
        results.context.find('.download-pdf').on('click', results.downloadDF);
        results.context.find('.download-csv').on('click', results.downloadCSV);
    },

    /**
     * Opens a new tab to download result PDF and destroys further onclick callbacks.
     * */
    downloadDF : function() {
        window.open('/maintaining/results/pdf/' + this.id);
        return false;
    },

    /**
     *  Opens a new tab to download result CSV and destroys further onclick callbacks.
     * */
    downloadCSV : function() {
        window.open('/maintaining/results/csv/' + this.id);
        return false;
    }

};