var _ = require('underscore');

module.exports = function( responseCodes ){
    function respond ( ){
        var res = this;
        var data, viewFile, responseCode;
        switch ( arguments.length ) {
            case 1:
                data = arguments[0];
                break;
            case 2:
                viewFile = arguments[0];
                data = arguments[1];
                break;
            case 3:
                viewFile = arguments[0];
                data = arguments[1];
                responseCode = arguments[2];
                break;
        }

        responseCode = data._code || responseCode;
        var out = {};
        out.data = data;
        var status = responseCodes[responseCode];
        out = _.extend( out, status );

        res.format({
            html: function(){
                if ( viewFile ){
                    switch ( typeof viewFile ){
                        case 'string' :
                            return res.render( viewFile, out );
                        case 'object' :
                            res.req.flash( out.success? 'success' : 'error', out.message );
                            return res.redirect( viewFile.redirect );
                    }
                } else {
                    return res.send('This action can not respond in html format');
                }
            },
            json: function(){
                if ( data ){
                    return res.send( out );
                }
                return res.send({success: false, message: "This action can not respond in json format" });
            }
        });
    }
    return respond;
}
