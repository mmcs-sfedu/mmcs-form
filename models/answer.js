module.exports = function(sequelize, DataTypes) {
    var answer = sequelize.define("answer", {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                notNull: true,
                autoIncrement: true
            },
            stage_description_id: {
                type: DataTypes.INTEGER,
                notNull: true,
                references: {
                    model: 'stage_descriptions',
                    key: 'id'
                },
                onDelete: 'cascade',
                onUpdate: 'cascade'
            },
            possible_answer_id: {
                type: DataTypes.INTEGER,
                notNull: true,
                references: {
                    model: 'possible_answers',
                    key: 'id'
                },
                onDelete: 'cascade',
                onUpdate: 'cascade'
            }
        },
        {
            classMethods: { }
        });

    answer.removeAttribute('id');

    return answer;
};
