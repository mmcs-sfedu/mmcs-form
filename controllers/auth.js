// TODO хранить в сессии, реализовать авторизацию с БРС!

var models = require('../models');


var authControllerNamespace = {
    /* STUDENT AUTHORIZATION BLOCK */

    userIdOrHash : null,
    userGroupId  : null,
    userName     : null,

    getStudentsAuthorization : function() {
        return authControllerNamespace.userIdOrHash;
    },



    /* ADMIN AUTHORIZATION BLOCK */

    /* Data about signed admin */
    adminIdOrHash : null, // also stores administrator's auth status
    adminName     : null,

    /**
     * Checks if admin has already authorized.
     * @returns {String} Admin ID or null (if not authorized).
     * */
    isAdminAuthorized : function() {
        return authControllerNamespace.adminIdOrHash;
    }

};


module.exports =
{
    /* STUDENT AUTHORIZATION BLOCK */

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

    getStudentsAuthorization : function() {
        return authControllerNamespace.userIdOrHash;
    },

    getUserName : function() {
        return authControllerNamespace.userName;
    },

    getStudentsGroupId : function() {
        return authControllerNamespace.userGroupId;
    },


    getStudentAuthChecker : function() {
        return function(req, res, next) {
            if (authControllerNamespace.getStudentsAuthorization()) {
                next();
            } else {
                res.redirect("/");
            }
        }
    },



    /* ADMIN AUTHORIZATION BLOCK */

    /**
     * Implements logout for admin.
     * */
    adminLogout : function() {
        authControllerNamespace.adminIdOrHash = null;
        authControllerNamespace.adminName     = null;
    },

    /**
     * Makes an attempt to authorize user as admin.
     * @param {String} login Administrator's login.
     * @param {String} password Administrator's password.
     * @param {Function} callback Login finished callback:
       - pass null to it if login was successful;
       - pass error string (with fail reason) to it if login was failed.
     * */
    adminAttemptLogin : function(login, password, callback) {
        /* Getting stored config to validate user auth data */
        var adminsConfig = require('../config/admins.json');

        /* MD5 password */
        var crypto = require('crypto');
        var passwordHash = crypto.createHash('md5').update(password).digest('hex');

        /* If there is no such login in config (or password mismatch) - throwing an error */
        if (adminsConfig[login] == null || adminsConfig[login]['password'] != passwordHash) {
            callback("Неправильный логин или пароль!");
        } else {
            /* Saving admin data and refreshing page */
            authControllerNamespace.adminIdOrHash = adminsConfig[login];
            authControllerNamespace.adminName = adminsConfig[login]['name'];
            callback(null)
        }
    },

    /* Returns admin ID if authorized */
    isAdminAuthorized : authControllerNamespace.isAdminAuthorized,

    /* Returns authorized admin name */
    getAdminName : function() {
        return authControllerNamespace.adminName;
    }

};