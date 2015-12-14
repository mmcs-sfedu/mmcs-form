module.exports = {
    saveErrorInSession : function(req, errorBody) {
        req.session.errors = errorBody;
    },
    fetchErrorFromSession : function(req) { // also clears errors from session
        var possibleErrors;
        if (req.session.errors) {
            possibleErrors = req.session.errors;
            req.session.errors = null;
        }
        return possibleErrors;
    }
};