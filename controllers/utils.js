/* Public methods */
module.exports =
{
    toNormalArray : toNormalArray
};

/**
 * Converts sequelize result objects to usual js format.
 * @param {Object} source Source object to convert.
 * @returns {Object} Converted JS object.
 * */
function toNormalArray(source) {
    return source.map(function(obj) { return obj.toJSON() });
}