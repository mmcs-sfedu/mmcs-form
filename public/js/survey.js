// called when document is rendered
$(document).ready(function() {
    survey.init();
});

// using namespace main
var survey = {
    all_selects : null,


    chosenStageDescription : null,


    init : function() {
        survey.all_selects = $('select');
        survey.all_selects.material_select();

        $('.modal-trigger').leanModal();
        // to open manually
        // $('#confirm').openModal();

        $('div.select-wrapper li').on('click', survey.onSelectClickListener());

        // for updating data of materialize selectors
        // $('select').material_select('destroy');
    },


    onSelectClickListener : function() {
        if ($(this).attr('class') != 'disabled') {
            var chosenIndex = $(this).index();
            var indexPointer = 0;
            $('select.initialized').find('option[value]').each(function() {
                indexPointer++;
                if (indexPointer == chosenIndex) {
                    survey.chosenStageDescription = $(this).val();
                }
            })
        }
    },


    checkForms : function() {
        var allChecked = true;
        $('.survey-form').each(function() {
            if ($(this).find(':checked').size() === 0) {
                allChecked = false;
            }
//            $(this).find(':checked').each(function() {
//                console.log($(this).attr('id')); // logging checked ids
//            });
        });

        if (allChecked)
            window.location = '/survey/finish';
        else
            Materialize.toast('Вы не ответили на все вопросы!', 5000)
    }
};