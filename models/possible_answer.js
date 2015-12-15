module.exports = function(sequelize, DataTypes) {
    var possible_answer = sequelize.define("possible_answer", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            notNull: true
        },
        text: {
            type: DataTypes.TEXT,
            notNull: true
        }
    },
        {
            classMethods: {
                associate: function(models) {
                    models.question.hasMany(possible_answer, {
                        onDelete: 'cascade',
                        onUpdate: 'cascade',
                        foreignKey: {
                            name: 'question_id',
                            allowNull: false
                        }
                    });
                }
            }
        });

    return possible_answer;
};
