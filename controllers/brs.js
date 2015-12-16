module.exports =
{
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
    }
};