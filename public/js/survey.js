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

        $('div.select-wrapper li').on('click', survey.onSelectClickListener);

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
                    survey.requestForms();
                }
            })
        }
    },


    requestForms : function() {
        survey.showLoader(true);

        var request = $.ajax({
            url: '/student/forms',
            method: 'GET',
            data: { stage_description_id : survey.chosenStageDescription },
            dataType: "json"
        });
        request.done(function(response) {
            survey.showLoader(false);
            survey.renderForm(response);
        });
        request.fail(function(jqXHR, textStatus) {
            survey.showLoader(false);
            Materialize.toast('Произошла ошибка получения вопросов анкетирования', 5000)
        });

        // survey.chosenStageDescription = null;
    },

    showLoader : function(show) {
        var formsDiv = $('.forms-list');
        if (show) {
            formsDiv.html('<div class="center"><div class="preloader-wrapper big active">' +
                '<div class="spinner-layer spinner-blue-only">' +
                '<div class="circle-clipper left">' +
                '<div class="circle"></div>' +
                '</div><div class="gap-patch">' +
                '<div class="circle"></div>' +
                '</div><div class="circle-clipper right">' +
                '<div class="circle"></div>' +
                '</div></div></div></div>');
        } else {
            formsDiv.html('');
        }
    },

    renderForm : function(form) {
        var formsDiv = $('.forms-list');

        form[0].questions.forEach(function(question) {
            var possibleAnswers = '';
            question.possible_answers.forEach(function(possibleAnswer) {
                possibleAnswers = possibleAnswers + '' +
                    '<p><input type="radio" name="'+ question.id +'" id="'+ question.id +'-'+ possibleAnswer.id +'">' +
                    '<label class="white-text" for="'+ question.id +'-'+ possibleAnswer.id +'">'+ possibleAnswer.text +'</label></p>'
            });

            formsDiv.html(formsDiv.html()
                + '<div class="row"><div class="col l8 m10 s12"><div class="card-panel blue">' +
                '<span class="white-text"><h5>'+question.text+'</h5><br>' +
                '<form action="#" class="survey-form">' +
                '' + possibleAnswers +
                '</form>' +
                '</span>' +
                '</div></div></div>');
        });


        formsDiv.html(formsDiv.html() + '' +
            '<br>' +
            '<a class="btn-large modal-trigger waves-effect waves-light red lighten-2" href="#confirm">Отправить</a>' +
            '<div id="confirm" class="modal"><div class="modal-content">' +
            '<h4>Вы подтверждаете отправку ответов?</h4>' +
            '<p>После подтверждения анкеты изменить ответы будет уже невозможно</p>' +
            '</div>' +
            '<div class="modal-footer">' +
            '<a href="#!" class="modal-action modal-close waves-effect waves-teal btn-flat">Нет</a>' +
            '<a href="#!" class="modal-action modal-close waves-effect waves-teal btn-flat" onclick="survey.checkForms();">Да</a>' +
            '</div>' +
            '</div>');

        $('.modal-trigger').leanModal();
    },


    checkForms : function() {
        var surveyForms = $('.survey-form');

        var allChecked = true;

        if (surveyForms.size() === 0)
            allChecked = false;

        var checkedAnswersIds = [];

        surveyForms.each(function() {
            if ($(this).find(':checked').size() === 0) {
                allChecked = false;
            }

            $(this).find(':checked').each(function() {
                var checkedAnswerId = $(this).attr('id');
                checkedAnswersIds.push(checkedAnswerId.split('-')[1]);
            });
        });

        if (allChecked) {
            var redirectUrl = '/survey/finish';
            $.redirectPost(redirectUrl, {
                stage_description_id: survey.chosenStageDescription,
                possible_answers: checkedAnswersIds
            });
        } else
            Materialize.toast('Вы не ответили на все вопросы!', 5000)
    }
};