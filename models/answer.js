module.exports = function(sequelize, DataTypes) {
    var answer = sequelize.define("answer", {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                notNull: true,
                autoIncrement: true
            },
            discipline_id: {
                type: DataTypes.INTEGER,
                notNull: true
            },
            teacher_id: {
                type: DataTypes.INTEGER,
                notNull: true
            },
            student_group: {
                type: DataTypes.INTEGER,
                notNull: true
            },
            student_course: {
                type: DataTypes.INTEGER,
                notNull: true
            },
            student_degree: {
                type: DataTypes.STRING,
                notNull: true
            }
        },
        {
            classMethods: {
                associate: function(models) {
                    models.feedback_stage.hasMany(answer, {
                        onDelete: 'cascade',
                        onUpdate: 'cascade',
                        foreignKey: {
                            name: 'feedback_stage_id',
                            allowNull: false
                        }
                    });
                    models.possible_answer.hasMany(answer, {
                        onDelete: 'cascade',
                        onUpdate: 'cascade',
                        foreignKey: {
                            name: 'possible_answer_id',
                            allowNull: false
                        }
                    });
                    models.discipline.hasMany(answer, {
                        onDelete: 'cascade',
                        onUpdate: 'cascade',
                        foreignKey: {
                            name: 'discipline_id',
                            allowNull: false
                        }
                    });
                    models.teacher.hasMany(answer, {
                        onDelete: 'cascade',
                        onUpdate: 'cascade',
                        foreignKey: {
                            name: 'teacher_id',
                            allowNull: false
                        }
                    });

                    answer.belongsTo(models.feedback_stage,  { foreignKey: 'feedback_stage_id' });
                    answer.belongsTo(models.possible_answer, { foreignKey: 'possible_answer_id' });
                    answer.belongsTo(models.discipline,  { foreignKey: 'discipline_id' });
                    answer.belongsTo(models.teacher, { foreignKey: 'teacher_id' });
                }
            }
        });

    return answer;
};
