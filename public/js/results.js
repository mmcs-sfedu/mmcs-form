/* Called when page was loaded. */
$(document).ready(function() {
    // Making all default configurations.
    results.init();
});

/* Namespace for results functions. */
var results = {

    /**
     * Function to be executed to make all pre-configs for this page.
     * */
    init : function() {
        /* Adding back button. */
        main.makeHeaderFixedAndAddNav('.admin-auth-context', '← К разделам',
            function () { window.location.href = '/maintaining'; }, '.container.maintaining-results-context');
    }

};