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
        },
        question_id: {
            type: DataTypes.INTEGER,
            notNull: true,
            references: {
                model: "questions",
                key: "id"
            },
            onDelete: 'cascade',
            onUpdate: 'cascade'
        }
    },
        {
            classMethods: { }
        });

    return possible_answer;
};
