// called when document is rendered
$(document).ready(function() {
    main.init();
});

// using namespace main
var main = {
    init : function() {
        /* Turning on dialog triggers for modal windows. */
        $('.modal-trigger').leanModal();
    },

    /**
     * Adds go back button with some action to the header bar.
     * @param {String} headerClass Root class of the navigation bar view.
     * @param {String} backText Text to write on the back button.
     * @param {Function} backFunc Some function to call when the back button was pressed.
     * @param {String} containerBelow Container to add nav bar spacing for.
     * */
    makeHeaderFixedAndAddNav : function(headerClass, backText, backFunc, containerBelow) {
        // Getting link to header
        var authHeader = $(headerClass);

        // Making header fixed
        authHeader.addClass('fixed-header');

        // Adding back button for header
        var leftNav = authHeader.find('.left-nav');
        leftNav.html('<a href="#!" class="white-text">' + backText + '</a>');
        leftNav.on('click', backFunc);


        // Adding true spacing for container (to fit auth header)
        $(containerBelow).css('margin-top', authHeader.height());
    }
};



/* To make POST redirects from JS. */
$.extend(
    {
        redirectPost: function(location, args)
        {
            var form = '';
            $.each(args, function(key, value) {
                // Preparing form inputs.
                form += '<input type="hidden" name="'+key+'" value="'+value+'">';
            });
            // Adding form with inputs to html page and submitting that form.
            $('<form action="'+location+'" method="POST">'+form+'</form>').appendTo('body').submit();
        }
    });