/**
 * Created by vladimir on 06.12.15.
 */

module.exports = function(sequelize, DataTypes) {
    var feedback_forms = sequelize.define("FEEDBACK_FORMS", {
        name:DataTypes.STRING
    }, {
        classMethods: {
        }
    });

    return feedback_forms;
};