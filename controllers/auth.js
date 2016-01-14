// TODO хранить в сессии, реализовать авторизацию с БРС!

var models = require('../models');


var authControllerNamespace = {
    userIdOrHash : null,
    userGroupId  : null,
    userName     : null,

    isStudentAuthorized : function() {
        return authControllerNamespace.userIdOrHash;
    }
};


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
        return models.discipline
            .find({ order: "random()" })
            .then(function(discipline) {
                if (discipline == null) {
                    callback("Ошибка базы данных - нет дисциплин!");
                    return;
                }
                authControllerNamespace.userIdOrHash = 11;
                authControllerNamespace.userGroupId  = discipline.group_id;
                authControllerNamespace.userName     = "Вася Пупкин";
                callback(null); })
    },

    isStudentAuthorized : authControllerNamespace.isStudentAuthorized,

    getUserName : function() {
        return authControllerNamespace.userName;
    },

    getGroupId : function() {
        return authControllerNamespace.userGroupId;
    },


    getStudentAuthChecker : function() {
        return function(req, res, next) {
            if (authControllerNamespace.isStudentAuthorized()) {
                next();
            } else {
                res.redirect("/");
            }
        }
    }
};