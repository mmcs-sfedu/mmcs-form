/* Called when page was loaded. */
$(document).ready(function() {
    disciplines.init();
});

/* Namespace for disciplines scripts. */
var disciplines = {
    context: null, // to make a namespace for jQuery (DOM)

    /**
     * Runs when the page was first time loaded.
     * */
    init: function () {
        // Setting context.
        disciplines.context = $('.maintaining-disciplines-context');

        /* Adding back button. */
        main.makeHeaderFixedAndAddNav('.admin-auth-context', '← К разделам',
            function () {
                window.location.href = '/maintaining';
            }, '.container.maintaining-disciplines-context');
    },

    /**
     * Deletes entity by id.
     * @param type Entity's type.
     * @param id ID to delete in DB.
     * */
    delEntity: function(type, id) {
        /* Describing del entity request. */
        var request = $.ajax({
            url: '/maintaining/entity',
            method: 'DELETE',
            data: JSON.stringify({ id:id, type:type }), // string will be parsed into json
            dataType: 'json',                           // you must specify these type params to make NodeJS read query
            contentType: 'application/json'
        });
        /* If everything is ok. TODO все поменять */
        request.done(function(response) {
            // Adding new form to list.
            try {
                //forms.context.find('.collection#forms').append(forms.generateFormsListItem(response.id, response.name, response.stages));
                //forms.updateDeleteButtonsListeners(); // adding onclick listener for new form item
                //btnCancel.click(); // closing dialog
                Materialize.toast('Форма успешно добавлена', 5000);
            } catch (exc) {
                proceedFail();
            }
        });
        /* In another case. */
        request.fail(function(jqXHR, textStatus) {
            proceedFail();
        });
        /* A function to proceed fail. */
        function proceedFail() {
            Materialize.toast('Не удалось создать форму', 5000);
        }
    },

    /**
     * Adds new entity.
     * @param type To create entity of the chosen type.
     * */
    addEntity: function(type) {
        /* Describing add entity request. */
        var request = $.ajax({
            url: '/maintaining/entity',
            method: 'POST',
            data: JSON.stringify({ type:type }), // string will be parsed into json
            dataType: 'json',                    // you must specify these type params to make NodeJS read query
            contentType: 'application/json'
        });
        /* If everything is ok. TODO все поменять */
        request.done(function(response) {
            // Adding new form to list.
            try {
                //forms.context.find('.collection#forms').append(forms.generateFormsListItem(response.id, response.name, response.stages));
                //forms.updateDeleteButtonsListeners(); // adding onclick listener for new form item
                //btnCancel.click(); // closing dialog
                Materialize.toast('Форма успешно добавлена', 5000);
            } catch (exc) {
                proceedFail();
            }
        });
        /* In another case. */
        request.fail(function(jqXHR, textStatus) {
            proceedFail();
        });
        /* A function to proceed fail. */
        function proceedFail() {
            Materialize.toast('Не удалось создать форму', 5000);
        }
    },

    updEntity: function(type, id, val) {
        /* Describing update entity request. */
        var request = $.ajax({
            url: '/maintaining/entity',
            method: 'PUT',
            data: JSON.stringify({ type:type, id:id, val:val }), // string will be parsed into json
            dataType: 'json',                                    // you must specify these type params to make NodeJS read query
            contentType: 'application/json'
        });
        /* If everything is ok. TODO все поменять */
        request.done(function(response) {
            // Adding new form to list.
            try {
                //forms.context.find('.collection#forms').append(forms.generateFormsListItem(response.id, response.name, response.stages));
                //forms.updateDeleteButtonsListeners(); // adding onclick listener for new form item
                //btnCancel.click(); // closing dialog
                Materialize.toast('Форма успешно добавлена', 5000);
                console.log(response);
            } catch (exc) {
                proceedFail();
            }
        });
        /* In another case. */
        request.fail(function(jqXHR, textStatus) {
            proceedFail();
        });
        /* A function to proceed fail. */
        function proceedFail() {
            Materialize.toast('Не удалось создать форму', 5000);
        }
    }

};