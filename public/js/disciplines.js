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

        // Adding all selectors for disciplines.
        disciplines.invalidateAllDisciplines();
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
    },





    invalidateAllDisciplines: function () {
        var whereToAppend = disciplines.context.find('.disciplines');
        whereToAppend.html('');

        for (var disciplineIndex = 0; disciplineIndex < disciplines.disciplines.length; ++disciplineIndex) {
            var discipline = disciplines.disciplines[disciplineIndex];

            var subjects = '';
            for (var subjectIndex = 0; subjectIndex < disciplines.subjects.length; ++subjectIndex) {
                var subject = disciplines.subjects[subjectIndex];
                subjects += '<option value="' + subject.id + '" ' + ((subject.id == discipline.subject_id) ? "selected" : "") + '>' + subject.name + '</option>';
            }

            var teachers = '';
            for (var teacherIndex = 0; teacherIndex < disciplines.teachers.length; ++teacherIndex) {
                var teacher = disciplines.teachers[teacherIndex];
                teachers += '<option value="' + teacher.id + '" ' + ((teacher.id == discipline.teacher_id) ? "selected" : "") + '>' + teacher.name + '</option>';
            }

            var groups = '';
            for (var groupIndex = 0; groupIndex < disciplines.groups.length; ++groupIndex) {
                var group = disciplines.groups[groupIndex];
                groups += '<option value="' + group.id + '" ' + ((group.id == discipline.group_id) ? "selected" : "") + '>' + group.name + '</option>';
            }

            whereToAppend.append(
                '<div class="row">' +
                '<select onchange="disciplines.updDiscipline(' + discipline.id + ', this.value, ' + discipline.teacher_id + ', '+ discipline.group_id +')" class="browser-default col l4 m4 s11">' +
                subjects +
                '</select>' +
                '<select onchange="disciplines.updDiscipline(' + discipline.id + ', ' + discipline.subject_id + ', this.value, ' + discipline.group_id +')" class="browser-default col l4 m4 s11">' +
                teachers +
                '</select>' +
                '<select onchange="disciplines.updDiscipline(' + discipline.id + ', ' + discipline.subject_id + ', ' + discipline.teacher_id + ', this.value)" class="browser-default col l3 m3 s11">' +
                groups +
                '</select> ' +
                '<i class="col l1 m1 s1 material-icons red-text text-lighten-2 pointer"' +
                   'onclick="disciplines.delDiscipline(' + discipline.id + ');">delete</i>' +
                '</div>');
        }



        // Applying material selectors.
        $('select').material_select();
    },

    addDiscipline: function () {
        /* Describing add discipline request. */
        var request = $.ajax({
            url: '/maintaining/discipline',
            method: 'POST',
            data: JSON.stringify({ }),           // string will be parsed into json
            dataType: 'json',                    // you must specify these type params to make NodeJS read query
            contentType: 'application/json'
        });
        /* If everything is ok. */
        request.done(function(addedDiscipline) {
            // Adding new discipline to the corresponding list.
            try {
                disciplines.disciplines.push(addedDiscipline);
                disciplines.invalidateAllDisciplines();
                Materialize.toast('Дисциплина успешно добавлена', 3000);
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
            Materialize.toast('Не удалось создать дисциплину', 3000);
        }
    },

    delDiscipline: function(id) {
        /* Describing del discipline request. */
        var request = $.ajax({
            url: '/maintaining/discipline',
            method: 'DELETE',
            data: JSON.stringify({ id:id }), // string will be parsed into json
            dataType: 'json',                // you must specify these type params to make NodeJS read query
            contentType: 'application/json'
        });
        /* If everything is ok. */
        request.done(function(deletedDiscipline) {
            // Removing deleted entity from list.
            try {
                var index = -1;
                for (var i = 0; i < disciplines.disciplines.length; ++i) {
                    if (disciplines.disciplines[i].id == deletedDiscipline.id) {
                        index = i;
                        break;
                    }
                }
                if(index != -1)
                    disciplines.disciplines.splice( index, 1 );
                disciplines.invalidateAllDisciplines();
                Materialize.toast('Дисциплина удалена', 3000);
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
            Materialize.toast('Не удалось удалить дисциплину', 3000);
        }
    },

    updDiscipline: function(id, subject_id, teacher_id, group_id) {
        /* Describing upd discipline request. */
        var request = $.ajax({
            url: '/maintaining/discipline',
            method: 'PUT',
            data: JSON.stringify({ id:id, subject_id:subject_id, teacher_id:teacher_id, group_id:group_id }), // string will be parsed into json
            dataType: 'json',                // you must specify these type params to make NodeJS read query
            contentType: 'application/json'
        });
        /* If everything is ok. */
        request.done(function(updatedDiscipline) {
            // Updating disciplines list.
            try {
                var index = -1;
                for (var i = 0; i < disciplines.disciplines.length; ++i) {
                    if (disciplines.disciplines[i].id == updatedDiscipline.id) {
                        index = i;
                        break;
                    }
                }
                if(index != -1) {
                    disciplines.disciplines[i].subject_id = subject_id;
                    disciplines.disciplines[i].teacher_id = teacher_id;
                    disciplines.disciplines[i].group_id = group_id;
                }
                disciplines.invalidateAllDisciplines();
                Materialize.toast('Дисциплина обновлена', 3000);
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
            Materialize.toast('Не удалось обновить дисциплину', 3000);
        }
    }

};