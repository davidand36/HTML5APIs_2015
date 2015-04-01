/*
  PlasticAjaxServer.js
  David M. Anderson

  Middleware for PlasticAjax Web site
*/

module.exports = function( express, dataDir, baseUrl ) {

    var router = express.Router();
    var fs = require( 'fs' );
    var url = require( 'url' );

    //=========================================================================

    router.get( '/catalog', sendCatalog );

    //=========================================================================

    var catalog;

    //-------------------------------------------------------------------------

    function getCatalog( callback ) {
        var catalogPath = dataDir + 'Catalog.json';
        var i, len, item;
        if ( catalog ) {
            callback( catalog );
        } else {
            fs.readFile( catalogPath, function( err, data ) {
                if ( err ) {
                    console.log( 'Unable to read ' + catalogPath );
                } else {
                    catalog = JSON.parse( data );
                    for ( i = 0, len = catalog.length; i < len; ++i ) {
                        item = catalog[ i ];
                        item.imageUrl = baseUrl + 'images/' + item.image;
                        item.thumbUrl = baseUrl + 'images/' + item.thumbnail;
                    }
                    callback( catalog );
                }
            } );
        }
    }

    //=========================================================================

    function sendCatalog( request, response ) {
        getCatalog( function( ) {
            var urlParts = url.parse( request.url, true );
            var query = urlParts.query;
            if ( query.getSize ) {
                response.send( JSON.stringify( catalog.length ) );
            } else {
                var offset = Number( query.offset ) || 0;
                var limit = Number( query.limit ) || catalog.length;
                var items = catalog.slice( offset, offset + limit );
                console.log( 'sendCatalog offset=', offset, ' limit=', limit,
                             ' (offset+limit)=', offset + limit,
                             ' items.length=', items.length );
                response.send( JSON.stringify( items ) );
            }
        } );
    }

    //=========================================================================

    return router;
};


//*****************************************************************************
