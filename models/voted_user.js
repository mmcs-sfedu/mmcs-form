module.exports = function(sequelize, DataTypes) {
    var voted_user = sequelize.define("voted_user", {
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
            account_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                notNull: true
            }
        },
        {
            classMethods: { }
        });

    voted_user.removeAttribute('id');

    return voted_user;
};
