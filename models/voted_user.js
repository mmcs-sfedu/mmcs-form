module.exports = function(sequelize, DataTypes) {
    var voted_user = sequelize.define("voted_user", {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                notNull: true,
                autoIncrement: true
            },
            account_id: {
                type: DataTypes.INTEGER,
                notNull: true
            },
            discipline_id: {
                type: DataTypes.INTEGER,
                notNull: true
            },
            teacher_id: {
                type: DataTypes.INTEGER,
                notNull: true
            }
        },
        {
            classMethods: {
                associate: function(models) {
                    models.feedback_stage.hasMany(voted_user, {
                        onDelete: 'cascade',
                        onUpdate: 'cascade',
                        foreignKey: {
                            name: 'feedback_stage_id',
                            allowNull: false
                        }
                    });
                    models.discipline.hasMany(voted_user, {
                        onDelete: 'cascade',
                        onUpdate: 'cascade',
                        foreignKey: {
                            name: 'discipline_id',
                            allowNull: false
                        }
                    });
                    models.teacher.hasMany(voted_user, {
                        onDelete: 'cascade',
                        onUpdate: 'cascade',
                        foreignKey: {
                            name: 'teacher_id',
                            allowNull: false
                        }
                    });

                    voted_user.belongsTo(models.feedback_stage, { foreignKey: 'feedback_stage_id' });
                    voted_user.belongsTo(models.discipline,  { foreignKey: 'discipline_id' });
                    voted_user.belongsTo(models.teacher, { foreignKey: 'teacher_id' });
                }
            }
        });

    // voted_user.removeAttribute('id');

    return voted_user;
};
