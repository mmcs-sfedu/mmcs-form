/**
 * Created by vladimir on 06.12.15.
 */

module.exports = function(sequelize, DataTypes) {
    var feedback_form = sequelize.define("FEEDBACK_FORM", {
        name:DataTypes.STRING,
        create_at: {
            type:DataTypes.DATE,
            defaultValue: Sequelize.NOW
        }
    }, {
        classMethods: {
        }
    });

    return feedback_form;
};