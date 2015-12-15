module.exports = function(sequelize, DataTypes) {
    var voted_user = sequelize.define("voted_user", {
            stage_description_id: {
                type: DataTypes.INTEGER,
                primaryKey: true
            },
            account_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                notNull: true
            }
        },
        {
            classMethods: {
                associate: function(models) {
                    models.stage_description.hasMany(voted_user, {
                        onDelete: 'cascade',
                        onUpdate: 'cascade',
                        foreignKey: {
                            name: 'stage_description_id',
                            allowNull: false
                        }
                    });
                }
            }
        });

    voted_user.removeAttribute('id');

    return voted_user;
};
