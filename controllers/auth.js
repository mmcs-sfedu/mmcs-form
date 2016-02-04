/* To get an access to DB. */
var models = require('../models');

/* Controllers import. */
var brsController = require('../controllers/brs');


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

/**
 * Tries to authorize student - in a success case saves user's data in session.
 * @param {Object} req To get an access to user's session.
 * @param {String} login Provided student's login.
 * @param {String} password Provided student's password.
 * @param {Function} callback Returns null in a success case (when user's data saved in session), error string in another case.
 * */
function studentAttemptLogin (req, login, password, callback) {
    /* Making async request with login and password to BRS. */
    brsController.attemptForStudentsAuth(login, password, function(error, studentID, groupID, studentName) {
        /* If there is no errors. */
        if (error) {
            callback(error);
            return;
        }

        /* And all data was provided. */
        if (studentID == null || groupID == null || studentName == null) {
            callback('При получении данных от БРС произошла ошибка.');
            return;
        }

        /* Than authorizing student (saving student's data in session). */
        saveStudentsDataInSession(req, studentID, groupID, studentName);
        callback();
    });


}

/**
 * Stores student's data in session after authorization.
 * @param {Object} req To access session.
 * @param {Integer} studentID Actual student ID.
 * @param {Integer} groupID Student's group.
 * @param {String} studentName Student's name.
 * */
function saveStudentsDataInSession(req, studentID, groupID, studentName) {
    req.session.student = {
        id    : studentID,
        group : groupID,
        name  : studentName
    }
}

/**
 * Checks if student was authorized.
 * @param {Object} session To get student's data in session.
 * @returns {Object} Returns null if student wasn't authorized, his account id - in another case.
 * */
function getStudentsAuthorization(session) {
    if (session != null && session.student != null && session.student.id != null)
        return session.student.id;
    return null;
}

/**
 * Checks session and returns student's name.
 * @param {Object} session To get student's data.
 * @returns {Object} Authorized student's name.
 * */
function getStudentsName (session) {
    if (session != null && session.student != null && session.student.name != null)
        return session.student.name;
    return null;
}

/**
 * Checks session and returns student's group ID.
 * @param {Object} session To get student's data.
 * @returns {Object} Authorized student's group ID.
 * */
function getStudentsGroupId(session) {
    if (session != null && session.student != null && session.student.group != null)
        return session.student.group;
    return null;
}

/**
 * Unauthorizes student.
 * @param {Object} req To access session.
 * */
function studentLogout (req) {
    if (req.session.student != null)
        req.session.student = null;
}

/**
 * Pre-routing check function generator. Redirects student on survey page, if he wasn't authorized.
 * @returns {Function} Checker function.
 * */
function getStudentAuthChecker() {
    return function(req, res, next) {
        if (getStudentsAuthorization(req.session)) {
            next();
        } else {
            res.redirect("/");
        }
    }
}



/* ADMIN AUTHORIZATION BLOCK */

/**
 * Makes an attempt to authorize user as admin.
 * @param {Object} req To access session.
 * @param {String} login Administrator's login.
 * @param {String} password Administrator's password.
 * @param {Function} callback Login finished callback:
 - pass null to it if login was successful;
 - pass error string (with fail reason) to it if login was failed.
 * */
function adminAttemptLogin(req, login, password, callback) {
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
        req.session.admin = {
            id   : adminsConfig[login],
            name : adminsConfig[login]['name']
        };
        callback(null)
    }
}

/**
 * Checks if admin has already authorized.
 * @returns {Object} True (if authorized) or null (if not authorized).
 * */
function isAdminAuthorized (session) {
    if (session != null && session.admin != null && session.admin.id != null)
        return true;
    return null;
}

/**
 * Checks session and returns admin's name.
 * @param {Object} session To get admin's data.
 * @returns {Object} Authorized admin's name.
 * */
function getAdminName(session) {
    if (session != null && session.admin != null && session.admin.name != null)
        return session.admin.name;
    return null;
}

/**
 * Unauthorizes admin.
 * @param {Object} req To access session.
 * */
function adminLogout(req) {
    if (req.session.admin != null)
        req.session.admin = null;
}
