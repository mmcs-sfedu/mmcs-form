/* To get an access to DB. */
var models = require('../models');


/* Public methods. */
module.exports =
{
    /* STUDENT AUTHORIZATION BLOCK */

    studentAttemptLogin : studentAttemptLogin,

    getStudentsAuthorization : getStudentsAuthorization,

    getStudentsName : getStudentsName,

    getStudentsGroupId : getStudentsGroupId,

    studentLogout : studentLogout,

    getStudentAuthChecker : getStudentAuthChecker,



    /* ADMIN AUTHORIZATION BLOCK */

    adminAttemptLogin : adminAttemptLogin,

    isAdminAuthorized : isAdminAuthorized,

    getAdminName : getAdminName,

    adminLogout : adminLogout
};



/* STUDENT AUTHORIZATION BLOCK */

var userIdOrHash, userGroupId, userName;

function studentAttemptLogin (login, password, callback) {
    if (login.length < 5) { // TODO для тестов
        callback("Неправильный логин или пароль!");
        return;
    }
    // TODO возвращает null в случ неудачи

    // TODO осторожно, хардкод! Всё должно приходить от БРС!
    // TODO для pgsql нужно хардкодить рандомную функцию!
    return models.discipline
        .find({ order: "random()" })
        .then(function(discipline) {
            if (discipline == null) {
                callback("Ошибка базы данных - нет дисциплин!");
                return;
            }
            userIdOrHash = 11;
            userGroupId  = discipline.group_id;
            userName     = "Вася Пупкин";
            callback(null); })
}

function getStudentsAuthorization() {
    return userIdOrHash;
}

function getStudentsName () {
    return userName;
}

function getStudentsGroupId() {
    return userGroupId;
}

function studentLogout () {
    userIdOrHash = null;
    userGroupId  = null;
    userName     = null;
}

function getStudentAuthChecker() {
    return function(req, res, next) {
        if (getStudentsAuthorization()) {
            next();
        } else {
            res.redirect("/");
        }
    }
}



/* ADMIN AUTHORIZATION BLOCK */

/* Data about signed admin */
var adminIdOrHash, // also stores administrator's auth status
    adminName;

/**
 * Makes an attempt to authorize user as admin.
 * @param {String} login Administrator's login.
 * @param {String} password Administrator's password.
 * @param {Function} callback Login finished callback:
 - pass null to it if login was successful;
 - pass error string (with fail reason) to it if login was failed.
 * */
function adminAttemptLogin(login, password, callback) {
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
        adminIdOrHash = adminsConfig[login];
        adminName = adminsConfig[login]['name'];
        callback(null)
    }
}

/**
 * Checks if admin has already authorized.
 * @returns {String} Admin ID or null (if not authorized).
 * */
function isAdminAuthorized () {
    return adminIdOrHash;
}

/* Returns authorized admin name */
function getAdminName() {
    return adminName;
}

/**
 * Implements logout for admin.
 * */
function adminLogout() {
    adminIdOrHash = null;
    adminName     = null;
}