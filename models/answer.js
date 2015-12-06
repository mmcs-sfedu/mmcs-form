module.exports = function(sequelize, DataTypes) {
    var answer = sequelize.define("answer", {
            result: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                notNull: true
            },
            stage_description_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                notNull: true,
                references: {
                    model: 'stage_descriptions',
                    key: 'id'
                },
                onDelete: 'cascade',
                onUpdate: 'cascade'
            },
            question_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                notNull: true,
                references: {
                    model: 'questions',
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
