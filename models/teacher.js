module.exports = function(sequelize, DataTypes) {
    var teacher = sequelize.define("teacher", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            notNull: true
        },
        first_name: {
            type: DataTypes.STRING
        },
            second_name: {
                type: DataTypes.STRING
            },
            last_name: {
                type: DataTypes.STRING
            }
    },
        {
            classMethods: {

                associate: function(models) {
                    models.discipline.hasMany(teacher, {
                        onDelete: 'cascade',
                        onUpdate: 'cascade',
                        foreignKey: {
                            name: 'discipline_id',
                            allowNull: false
                        }
                    });

                    teacher.belongsTo(models.discipline, { foreignKey: 'discipline_id' });
                }

            }
        });

    return teacher;
};
