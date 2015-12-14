// TODO хранить в сессии, реализовать авторизацию с БРС!

module.exports =
{
    studentLogout : function() {
        authControllerNamespace.userIdOrHash = null;
    },

    studentAttemptLogin : function(login, password, callback) {
        if (login.length < 5) { // TODO для тестов
            callback("Неправильный логин или пароль!");
            return;
        }

        authControllerNamespace.userIdOrHash = "someUserID";
        callback(null);
    },

    isStudentAuthorized : function() {
        return authControllerNamespace.userIdOrHash;
    }
};

var authControllerNamespace = {
    userIdOrHash : null,
    userGroupId  : null
};