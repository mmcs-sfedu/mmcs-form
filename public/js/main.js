// called when document is rendered
$(document).ready(function() {
    main.init();
});

// using namespace main
var main = {
    init : function() {
        /* Turning on dialog triggers for modal windows. */
        $('.modal-trigger').leanModal();

        /* Adding on mouse hints for buttons. */
        main.registerBtnsForHintsPopups();
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
    },

    /**
     *  Looks for every buttons with hints and adds popup logic for them.
     *  */
    registerBtnsForHintsPopups : function() {
        // Iterating throw all potential buttons.
        $('a.btn-floating:has(i)').each(function() {

            // Checking if current button has a hint.
            var currentButton = $(this);
            var hintSpans = currentButton.find('span#hint');
            if (hintSpans.length != 0) {

                // Creating a hint block with hint's text.
                var hintBlock = $('<div class="hint-popup card-panel green-text">' + hintSpans.first().html() + '</div>');

                // Describing functions which will show or hide hint popup.
                function showHint() {
                    // Setting position for hint popup.
                    hintBlock.css('top', (currentButton.offset().top + currentButton.height()));
                    hintBlock.css('left', (currentButton.offset().left + currentButton.width() / 2));

                    // Appending hint popup to the body of the page.
                    $('body').append(hintBlock);
                }
                function hideHint() { hintBlock.remove(); }

                // Resetting and adding hint popup logic for button.
                currentButton.off('click', hideHint);
                currentButton.off('mouseover', showHint);
                currentButton.off('mouseout', hideHint);
                currentButton.on('click', hideHint);
                currentButton.on('mouseover', showHint);
                currentButton.on('mouseout', hideHint);
            }
        })
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