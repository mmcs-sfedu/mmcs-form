module.exports = function(sequelize, DataTypes) {
    var subject = sequelize.define("subject", {
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

    return subject;
};
