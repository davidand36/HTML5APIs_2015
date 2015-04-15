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
    router.get( '/item', sendItem );
    router.post( '/order', processOrder );

    //=========================================================================

    var catalog;
    var items = { };

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
                        items[ item.id ] = item;
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

    function sendItem( request, response ) {
        getCatalog( function( ) {
            var urlParts = url.parse( request.url, true );
            var query = urlParts.query;
            var itemId = query.itemId;
            var item = items[ itemId ];
            response.send( JSON.stringify( item ) );
        } );
    }

    //=========================================================================

    function processOrder( request, response ) {
        var customerName, customerAddress;
        var cart = {};
        var cartTally;

        customerName = request.body.name;
        customerAddress = request.body.address;
        if ( request.body.cart ) {
            cart = JSON.parse( request.body.cart );
        }

        getCatalog( function( ) {
            var cartTally = tallyCart( cart );

            response.send( JSON.stringify( {
                customerName: customerName,
                addressLines: customerAddress.split( '\n' ),
                lineItems: cartTally.lineItems,
                shipping: cartTally.shipping,
                total: cartTally.total
            } ) );
        } );
    }

    //-------------------------------------------------------------------------

    function tallyCart( cart ) {
        var itemId, item, quantity, linePrice;
        var lineItems = [];
        var shipping;
        var total = 0;

        for ( itemId in cart ) {
            item = items[ itemId ];
            quantity = cart[ itemId ];
            linePrice = item.price * quantity;
            lineItems.push( {
                quantity: quantity,
                name: item.name,
                itemPrice: centsToDollars( item.price ),
                linePrice: centsToDollars( linePrice )
            } );
            total += linePrice;
        }
        shipping = 500 * Math.ceil( total / 500 );
        total += shipping;

        return {
            lineItems: lineItems,
            shipping: centsToDollars( shipping ),
            total: centsToDollars( total, true )
        };
    }

    //-------------------------------------------------------------------------

    function centsToDollars( cents, withSign ) {
        var pre = withSign  ?  '$'  :  '';
        return pre + (cents / 100).toFixed( 2 );
    }

    //=========================================================================

    return router;
};


//*****************************************************************************
