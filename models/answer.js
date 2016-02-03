module.exports = function(sequelize, DataTypes) {
    var answer = sequelize.define("answer", {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                notNull: true,
                autoIncrement: true
            }
        },
        {
            classMethods: {
                associate: function(models) {
                    models.stage_description.hasMany(answer, {
                        onDelete: 'cascade',
                        onUpdate: 'cascade',
                        foreignKey: {
                            name: 'stage_description_id',
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

                    answer.belongsTo(models.stage_description, { foreignKey: 'stage_description_id' });
                    answer.belongsTo(models.possible_answer,   { foreignKey: 'possible_answer_id' });
                }
            }
        });

    return answer;
};
