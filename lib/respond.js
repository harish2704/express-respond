
var _ = require('underscore');

var simpleSuccess = {
    success: true,
    message: 'Success.'
};
var simpleFailure = {
    success: false,
    message: 'Error!'
};

var defaultCodes = {
    null : simpleSuccess,
    undefined: simpleSuccess,
    true: simpleSuccess,
    false: simpleFailure,

    404: _.defaults( { message: 'Item not found'}, simpleFailure ),
    403: _.defaults( { message: 'Access denied'}, simpleFailure ),
    'sever-error': _.defaults( { message: 'Server Error'}, simpleFailure ),
    'database-error': _.defaults( { message: 'Database Error'}, simpleFailure ),
    'validation-error' : _.defaults( { message: 'Validation Error'}, simpleFailure ),

    'permission-denied': _.defaults( { message: 'Permission denied'}, simpleFailure ),
    'login-success': _.defaults( { message: 'Successfully logged in'}, simpleSuccess ),
    'login-failed': _.defaults( { message: 'Invalid username or password'}, simpleFailure )
};

var sendNotAccptable = function( res ){
    // Send 'Not Acceptable'
    res.status( 406 );
    return res.send( { success: false, message: 'Not Acceptable' } );
};

module.exports = function( app, responseCodes ){
    responseCodes = responseCodes || defaultCodes;
    function respond ( viewFile ){
        var res = this;
        var data, responseCode, flash;
        switch ( arguments.length ) {
            case 2:
                data = arguments[1];
                responseCode = data.$code;
                break;
            case 3:
                data = arguments[2];
                responseCode = arguments[3];
                break;
        }

        delete data.$code;
        flash = data.$flash || {};
        delete data.$flash;

        // for eg: res.respond(404);
        if ( typeof viewFile == 'number' ){
            res.status(viewFile);
            responseCode = viewFile;
            viewFile = viewFile.toString();
            data = {};
        }

        var status = responseCodes[responseCode];
        var out = {
            data: data,
            success: status.success,
            message: status.message,
        };

        res.format({
            html: function(){
                if ( viewFile ){
                    if( typeof viewFile ){
                        return res.render( viewFile, out );
                    }
                    var flashType = flash.type || ( out.success? 'success': 'error' );
                    res.req.flash( flashType, out );
                    return res.redirect( viewFile.$to );
                } 
                return sendNotAccptable( res );
            },
            json: function(){
                if ( data ){
                    return res.send( out );
                }
                return sendNotAccptable( res );
            }
        });
    }
    app.response.respond = respond;
};
