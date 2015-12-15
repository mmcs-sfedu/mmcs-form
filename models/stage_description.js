module.exports = function(sequelize, DataTypes) {
    var stage_description = sequelize.define("stage_description", {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                notNull: true
            }
        },
        {
            classMethods: {
                associate: function(models) {
                    models.discipline.hasMany(stage_description, {
                        onDelete: 'cascade',
                        onUpdate: 'cascade',
                        foreignKey: {
                            name: 'discipline_id',
                            allowNull: false
                        }
                    });
                    models.feedback_stage.hasMany(stage_description, {
                        onDelete: 'cascade',
                        onUpdate: 'cascade',
                        foreignKey: {
                            name: 'feedback_stage_id',
                            allowNull: false
                        }
                    });

                    stage_description.belongsTo(models.discipline,     { foreignKey: 'discipline_id' });
                    stage_description.belongsTo(models.feedback_stage, { foreignKey: 'feedback_stage_id' });
                }
            }
        });

    return stage_description;
};