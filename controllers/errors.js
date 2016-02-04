module.exports = {

    /**
     * Saves an error in the session.
     * @param {Object} req To access session.
     * @param {String} errorBody Error message.
     * */
    saveErrorInSession : function(req, errorBody) {
        req.session.errors = errorBody;
    },

    /**
     *  Gets an error from the session if have some.
     *  @param {Object} req To access session.
     *  @returns {String} Returns string with error description if have some saved, null - otherwise.
     *  */
    fetchErrorFromSession : function(req) { // also clears errors from session
        var possibleErrors = req.session.errors;
        if (possibleErrors) {
            req.session.errors = null; // clearing errors in session, 'cause we've already popped it
        }
        return possibleErrors;
    }

};