module.exports = function(sequelize, DataTypes) {
    var feedback_stage = sequelize.define("feedback_stage", {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                notNull: true
            },
            date_from: {
                type: DataTypes.DATE,
                notNull: true
            },
            date_to: {
                type: DataTypes.DATE,
                notNull: true
            }
        },
        {
            classMethods: {
                associate: function(models) {
                    models.feedback_form.hasMany(feedback_stage, {
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

    return feedback_stage;
};