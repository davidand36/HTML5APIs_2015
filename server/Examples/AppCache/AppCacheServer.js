/*
  AppCacheServer.js
  David M. Anderson

  Server-side script for AppCache demo
*/

module.exports = function( express, dataDir ) {

    var router = express.Router();
    var fs = require( 'fs' );

    //=========================================================================

    router.get( '/appcache.manifest', setManifest );
    router.get( '/ServerData.js', sendDataJs );

    //=========================================================================

    function setManifest( request, response ) {
        var manifestPath = dataDir + 'appcache.manifest';
        fs.readFile( manifestPath, function( err, data ) {
            if ( err ) {
                console.log( 'Unable to read ' + manifestPath );
            } else {
                response.setHeader( 'Content-Type', 'text/cache-manifest' );
                response.setHeader( 'Cache-Control', 'no-cache' );
                response.send( data );
            }
        } );
    }

    //=========================================================================

    function sendDataJs( request, response ) {
        var serverTime = new Date();
        var timeText = 'The time on the server is ' + serverTime.toString();
        response.setHeader( 'content-type', 'application/javascript' );
        response.send( 'var serverTimeString = "' + timeText + '";' );
    }

    //=========================================================================

    return router;
};


//*****************************************************************************

