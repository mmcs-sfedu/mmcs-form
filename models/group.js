module.exports = function(sequelize, DataTypes) {
    var group = sequelize.define("group", {
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

    return group;
};
