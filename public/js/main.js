// called when document is rendered
$(document).ready(function() {
    // main.init();

    /* Turning on dialog windows. */
    $('.modal-trigger').leanModal();
});

// using namespace main
var main = {
    all_selects : null,

    init : function() {
        main.all_selects = $('select');
        main.all_selects.material_select();

        // for updating data of materialize selectors
        // $('select').material_select('destroy');
    }
};



/* To make POST redirects from JS. */
$.extend(
    {
        redirectPost: function(location, args)
        {
            var form = '';
            $.each( args, function( key, value ) {
                form += '<input type="hidden" name="'+key+'" value="'+value+'">';
            });
            $('<form action="'+location+'" method="POST">'+form+'</form>').appendTo('body').submit();
        }
    });