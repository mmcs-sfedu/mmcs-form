// called when document is rendered
$(document).ready(function() {
    survey.init();
});

// using namespace main
var survey = {
    all_selects : null,

    init : function() {
        survey.all_selects = $('select');
        survey.all_selects.material_select();

        $('.modal-trigger').leanModal();
        // to open manually
        // $('#confirm').openModal();

        $('div.select-wrapper li').on('click', function() {
            if ($(this).attr('class') != 'disabled') {
                // TODO колбэк для выбора дисциплины
                console.log($(this).index());
            }
        });

        // for updating data of materialize selectors
        // $('select').material_select('destroy');
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