module.exports = function(sequelize, DataTypes) {
    var teacher = sequelize.define("teacher", {
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
            classMethods: {}
        });

    return teacher;
};
