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
     * Adds corresponding entity into the section.
     * @param type Entity's type.
     * @param entity Data to draw.
     * */
    renderEntity: function(type, entity) {
        var whereToAdd = disciplines.context.find('.entities.' + type);
        var name = (entity.name) ? entity.name : '';
        whereToAdd.append('<div id="' + entity.id + '">' +
                          '<div class="input-field">' +
                          '<input type="text" value="' + name + '" onchange="disciplines.updEntity(\'' + type + '\', ' + entity.id + ', this.value);">' +
                          '<i class="material-icons red-text text-lighten-2 pointer" onclick="disciplines.delEntity(\'' + type + '\', ' + entity.id + ');">delete</i></div></div>');
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
        /* If everything is ok. */
        request.done(function(deletedEntity) {
            // Removing deleted entity from list.
            try {
                disciplines.context.find('.entities.' + type).find('#' + id).remove();
                Materialize.toast('Запись удалена', 3000);
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
            Materialize.toast('Не удалось удалить запись', 3000);
        }
    },

    /**
     * Adds new entity with empty name.
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
        /* If everything is ok. */
        request.done(function(addedEntity) {
            // Adding new entity to the corresponding list.
            try {
                disciplines.renderEntity(type, addedEntity);
                Materialize.toast('Запись успешно добавлена', 3000);
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
            Materialize.toast('Не удалось создать запись', 3000);
        }
    },

    /**
     * Updates entity's value in the database.
     * @param type Which entity to update.
     * @param id Entity's identifier.
     * @param val New value.
     * */
    updEntity: function(type, id, val) {
        /* Describing update entity request. */
        var request = $.ajax({
            url: '/maintaining/entity',
            method: 'PUT',
            data: JSON.stringify({ type:type, id:id, val:val }), // string will be parsed into json
            dataType: 'json',                                    // you must specify these type params to make NodeJS read query
            contentType: 'application/json'
        });
        /* If everything is ok. */
        request.done(function(response) {
            // Adding new form to list.
            try {
                Materialize.toast('Запись успешно обновлена', 3000);
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
            Materialize.toast('Не удалось обновить запись', 3000);
        }
    }

};