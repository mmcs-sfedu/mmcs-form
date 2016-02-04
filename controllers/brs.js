/**
 * TODO КОНТРОЛЛЕР ЦЕЛИКОМ И ПОЛНОСТЬЮ СОСТОИТ ИЗ ЗАГЛУШЕК,
 * TODO КОТОРЫЕ СЛЕДУЕТ ЗАМЕНИТЬ НА РЕАЛЬНЫЕ АСИНХРОННЫЕ МЕТОДЫ.
 *
 * TODO ОЧЕНЬ ЖЕЛАТЕЛЬНО СОХРАНИТЬ ФОРМАТ ОТВЕТОВ (id, name), ЧТОБЫ ВСЁ НЕ ПОПЛЫЛО.
 * TODO СКОРЕЙ ВСЕГО, НУЖНЫ МЕТОДЫ КАК ОДИНОЧНОГО ПОЛУЧЕНИЯ СУЩНОСТИ, ТАК И НЕСКОЛЬКИХ ЗА ОДИН ЗАПРОС СРАЗУ.
 * */
module.exports =
{

    attemptForStudentsAuth : function(login, password, callback) {
        /**
         * TODO здесь осуществляется авторизация в сервисе БРС,
         * TODO которая в случае успеха возвращает в колбэке пустую ошибку, ID пользователя, ID его группы, имя пользователя.
         * */

        /** TODO заглушка. */

        var models = require('../models');

        models.discipline
            .find({ order: "random()" })
            .then(function(discipline) {
                if (discipline == null) {
                    callback("Ошибка базы данных - нет дисциплин!");
                    return;
                }

                callback(null, 11, discipline.group_id, 'Вася Пупкин');
            });
    },

    getBrsSubjects : function(groupId) {
        var subjects = [];
        for (var i = 5; i >= 0; i--) {
            subjects.push({
                id: i,
                name: "Дисциплина " + (5 - i)
            })
        }

        return subjects;
    },

    getBrsTeachers : function(groupId) {
        var teachers = [];
        for (var i = 0; i <= 5; i++) {
            teachers.push({
                id: i,
                name: "Учитель " + i
            })
        }

        return teachers;
    },

    getBrsGroups : function() {
        var groups = [];
        for (var i = 0; i <= 5; i++) {
            groups.push({
                id: i,
                name: "Группа " + i
            });
        }

        return groups;
    }

};