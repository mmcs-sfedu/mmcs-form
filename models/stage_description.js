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
                references: 'disciplines',
                referenceKey: 'id',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            feedback_stage_id: {
                type: DataTypes.INTEGER,
                notNull: true,
                references: 'feedback_stages',
                referenceKey: 'id',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            }
        },
        {
            classMethods: {

            }
        });

    return stage_description;
};