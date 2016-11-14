var request = require('request');
var env       = process.env.NODE_ENV || 'development';
var config    = require(__dirname + '/../config/config.json')[env];

module.exports =
{

    attemptForStudentsAuth : function(login, password, callback) {

        request.get(
            config.api.url + '/api/v0/auth/userinfo?' +
            'token=' + config.api.token + '&' +
            'login=' + login + '&' +
            'password=' + password,
            { form: {
                // token: 'fc0e5f16a22c3196e052d7fdf20a710f19419607',
                // login: login,
                // password: password
            } },
            function (error, response, body) {
                var parsed = JSON.parse(body);
                if (!parsed)
                    return callback("Не удалось провести авторизацию");

                if (!error && response.statusCode == 200) {
                    var resp = parsed['response'];

                    return callback(null, resp['StudentID'], resp['Group'], resp['Grade'], resp['Degree'], resp['FirstName'] + ' ' + resp['SecondName'] + ' ' + resp['LastName']);
                }

                return callback("Не удалось провести авторизацию: " + parsed['message']);
            }
        );
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
