module.exports = function(sequelize, DataTypes) {
    var question = sequelize.define("question", {
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
                    models.feedback_form.hasMany(question, {
                        onDelete: 'cascade',
                        onUpdate: 'cascade',
                        foreignKey: {
                            name: 'feedback_form_id',
                            allowNull: false
                        }
                    });
                }
            }
        });

    return question;
};
