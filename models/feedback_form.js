module.exports = function(sequelize, DataTypes) {

    var feedback_form = sequelize.define("feedback_form", {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                notNull: true
            },
            name: {
                type: DataTypes.STRING,
                notNull: true
            }
        },
        {
            classMethods: { }
        });

    return feedback_form;
};