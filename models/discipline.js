module.exports = function(sequelize, DataTypes) {
    var discipline = sequelize.define("discipline", {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                notNull: true
            },
            teacher_id: {
                type: DataTypes.INTEGER,
                notNull: true
            },
            subject_id: {
                type: DataTypes.INTEGER,
                notNull: true
            },
            group_id: {
                type: DataTypes.INTEGER,
                notNull: true
            }
        },
        {
            classMethods: { }
        });

    return discipline;
};