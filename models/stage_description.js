module.exports = function(sequelize, DataTypes) {
    var stage_description = sequelize.define("stage_description", {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                notNull: true
            },
            discipline_id: {
                type: DataTypes.INTEGER,
                notNull: true,
                references: {
                    model: 'disciplines',
                    key: 'id'
                },
                onDelete: 'cascade',
                onUpdate: 'cascade'
            },
            feedback_stage_id: {
                type: DataTypes.INTEGER,
                notNull: true,
                references: {
                    model: 'feedback_stages',
                    key: 'id'
                },
                onDelete: 'cascade',
                onUpdate: 'cascade'
            }
        },
        {
            classMethods: { }
        });

    return stage_description;
};