module.exports =
{
    studentLogout : function() {
        authControllerNamespace.auth = false;
        console.log('student logged out');
    },
    isStudentAuthorized : function() {
        return authControllerNamespace.auth;
    }
};

var authControllerNamespace = {
    auth : true
};