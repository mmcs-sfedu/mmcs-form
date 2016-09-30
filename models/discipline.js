module.exports = function(sequelize, DataTypes) {
    var discipline = sequelize.define("discipline", {
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

    return discipline;
};