module.exports = function(sequelize, DataTypes) {
    var feedback_stage = sequelize.define("feedback_stage", {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                notNull: true
            },
            feedback_form_id: {
                type: DataTypes.INTEGER,
                notNull: true,
                references: {
                    model: "feedback_forms",
                    key: "id"
                },
                onDelete: 'cascade',
                onUpdate: 'cascade'
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
            classMethods: { }
        });

    return feedback_stage;
};