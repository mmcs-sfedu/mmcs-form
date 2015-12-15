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
                }
            }
        });

    return stage_description;
};