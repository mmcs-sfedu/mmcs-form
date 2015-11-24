// called when document is rendered
$(document).ready(function() {
    // main.init();
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