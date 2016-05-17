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
            classMethods: {
                associate: function(models) {
                    models.group.hasMany(discipline, {
                        onDelete: 'cascade',
                        onUpdate: 'cascade',
                        foreignKey: {
                            name: 'group_id',
                            allowNull: false
                        }
                    });
                    models.subject.hasMany(discipline, {
                        onDelete: 'cascade',
                        onUpdate: 'cascade',
                        foreignKey: {
                            name: 'subject_id',
                            allowNull: false
                        }
                    });
                    models.teacher.hasMany(discipline, {
                        onDelete: 'cascade',
                        onUpdate: 'cascade',
                        foreignKey: {
                            name: 'teacher_id',
                            allowNull: false
                        }
                    });

                    discipline.belongsTo(models.group, { foreignKey: 'group_id' });
                    discipline.belongsTo(models.subject, { foreignKey: 'subject_id' });
                    discipline.belongsTo(models.teacher, { foreignKey: 'teacher_id' });
                }
            }
        });

    return discipline;
};