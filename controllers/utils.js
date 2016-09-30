/* Public methods */
module.exports =
{
    toNormalArray : toNormalArray,

    updateOrCreate : function (model, where, newItem, onCreate, onUpdate, onError) {
        // First try to find the record
        model.findOne({where: where}).then(function (foundItem) {
            if (!foundItem) {
                // Item not found, create a new one
                model.create(newItem)
                    .then(function () {
                        onCreate();
                    })
                    .error(function (err) {
                        onError(err);
                    });
            } else {
                // Found an item, update it
                model.update(newItem, {where: where})
                    .then(function () {
                        onUpdate();
                    })
                    .catch(function (err) {
                        onError(err);
                    });
                ;
            }
        }).catch(function (err) {
            onError(err);
        });
    }
};

/**
 * Converts sequelize result objects to usual js format.
 * @param {Object} source Source object to convert.
 * @returns {Object} Converted JS object.
 * */
function toNormalArray(source) {
    return source.map(function(obj) { return obj.toJSON() });
}