// TODO хранить в сессии, реализовать авторизацию с БРС!

var models = require('../models');

module.exports =
{
    studentLogout : function() {
        authControllerNamespace.userIdOrHash = null;
        authControllerNamespace.userGroupId  = null;
        authControllerNamespace.userName     = null;
    },

    studentAttemptLogin : function(login, password, callback) {
        if (login.length < 5) { // TODO для тестов
            callback("Неправильный логин или пароль!");
            return;
        }

        // TODO осторожно, хардкод! Всё должно приходить от БРС!
        // TODO для pgsql нужно хардкодить рандомную функцию!
        return models.discipline.find({ order: "random()" })
            .then(function(discipline) {
                authControllerNamespace.userIdOrHash = 11;
                authControllerNamespace.userGroupId  = discipline.group_id;
                authControllerNamespace.userName     = "Вася Пупкин";
                callback(null);
        });
    },

    isStudentAuthorized : function() {
        return authControllerNamespace.userIdOrHash;
    },

    getUserName : function() {
        return authControllerNamespace.userName;
    },

    getGroupId : function() {
        return authControllerNamespace.userGroupId;
    }
};

var authControllerNamespace = {
    userIdOrHash : null,
    userGroupId  : null,
    userName     : null
};