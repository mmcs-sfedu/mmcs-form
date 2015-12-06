/**
 * Created by vladimir on 06.12.15.
 */

module.exports = function(sequelize, DataTypes) {
    var feedback_form = sequelize.define("feedback_form", {
        name:DataTypes.STRING
    }, {
        classMethods: {
        }
    });

    return feedback_form;
};