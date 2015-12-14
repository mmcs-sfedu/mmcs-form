// TODO хранить в сессии, реализовать авторизацию с БРС!

module.exports =
{
    studentLogout : function() {
        authControllerNamespace.auth = false;
    },

    studentAttemptLogin : function(login, password, callback) {
        if (login.length < 5) { // TODO для тестов
            callback("Неправильный логин или пароль!");
            return;
        }

        authControllerNamespace.auth = true;
        callback(null);
    },

    isStudentAuthorized : function() {
        return authControllerNamespace.auth;
    }
};

var authControllerNamespace = {
    auth : false
};