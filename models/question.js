/**
 * Created by vladimir on 06.12.15.
 */

module.exports = function(sequelize, DataTypes) {
    var questions = sequelize.define("question", {
        name:DataTypes.STRING,
        feedback_form_id: {
            references: "feedback_form",
            referencesKey: "id"
        }
    }, {
        classMethods: {
        }
    });

    return questions;
};
