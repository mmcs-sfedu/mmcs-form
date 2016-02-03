// called when document is rendered
$(document).ready(function() {
    main.init();
});

// using namespace main
var main = {
    init : function() {
        /* Turning on dialog triggers for modal windows. */
        $('.modal-trigger').leanModal();
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