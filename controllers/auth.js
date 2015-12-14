module.exports =
{
    studentLogout : function() {
        authControllerNamespace.auth = false;
        console.log('student logged out');
    },
    studentAttemptLogin : function(callback) {
        callback(true);
    },
    isStudentAuthorized : function() {
        return authControllerNamespace.auth;
    }
};

var authControllerNamespace = {
    auth : true
};