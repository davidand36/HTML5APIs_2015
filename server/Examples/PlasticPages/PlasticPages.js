/*
  PlasticPages.js
  David M. Anderson

  Middleware for PlasticPages Web site
*/

module.exports = function( express, app, viewsDir, dataDir, baseUrl ) {

    var router = express.Router();
    var handlebars = require( 'express-handlebars' )( {
        layoutsDir: viewsDir + 'layouts',
        defaultLayout: 'main'
    } );
    var fs = require( 'fs' );
    var CART_COOKIE_NAME = 'PlasticPages_cart';

    //=========================================================================

    app.set( 'views', viewsDir );
    app.engine( '.handlebars', handlebars );
    app.set( 'view engine', 'handlebars' );

    //-------------------------------------------------------------------------

    router.get( '/', doHomePage );
    router.get( '/catalog/:page', doCatalogPage );
    router.get( '/item/:itemId', doItemPage );
    router.get( '/cart', doCartPage );
    router.post( '/cart/add', doAddToCartPage );
    router.get( '/checkout', doCheckoutPage );
    router.post( '/order', doOrderPage );

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

    function doHomePage( request, response ) {
        response.render( 'home', {
            baseUrl: baseUrl
        } );
    }

    //=========================================================================

    function doCatalogPage( request, response ) {
        var pageSize = 4;
        getCatalog( function( ) {
            var numPages = Math.ceil( catalog.length / pageSize );
            var page = Number( request.params.page );
            var start = (page - 1) * pageSize; //1-based page numbering
            var pageItems = catalog.slice( start, start + pageSize );
            response.render( 'catalog', {
                baseUrl: baseUrl,
                items: pageItems,
                currentPage: page,
                numPages: numPages,
                helpers: {
                    paginator: paginator
                }
            } );
        } );
    }

    //-------------------------------------------------------------------------

    function paginator( numPages, curPage, pageUrl ) {
        var html = '<ul class="paginator">';
        for ( var i = 1; i <= numPages; ++i ) {
            if ( i === curPage ) {
                html += '<li><span>' + i + '</span></li>';
            } else {
                html += '<li><a href="' + baseUrl + pageUrl + i + '">' +
                    i + '</a></li>';
            }
        }
        html += '</ul>';
        return html;
    }

    //=========================================================================

    function doItemPage( request, response ) {
        getCatalog( function( ) {
            var itemId = request.params.itemId;
            var item = findItem( itemId );
            if ( item ) {
                response.render( 'item', {
                    baseUrl: baseUrl,
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    imageUrl: item.imageUrl,
                    price: item.price
                } );
            } else {
                response.status( 404 ).send( 'No item with requested ID' );
            }
        } );
    }

    //=========================================================================

    function doAddToCartPage( request, response ) {
        var cart = {};
        var itemId;
        var cartTally;

        if ( request.cookies[ CART_COOKIE_NAME ] ) {
            cart = JSON.parse( request.cookies[ 'PlasticPages_cart' ] );
        }
        itemId = request.body.itemId;
        if ( cart[ itemId ] ) {
            ++cart[ itemId ];
        } else {
            cart[ itemId ] = 1;
        }
        response.cookie( CART_COOKIE_NAME, JSON.stringify( cart ) );

        getCatalog( function( ) {
            cartTally = tallyCart( cart );

            response.render( 'cart', {
                baseUrl: baseUrl,
                lineItems: cartTally.lineItems,
                shipping: cartTally.shipping,
                total: cartTally.total
            } );
        } );
    }

    //=========================================================================

    function doCartPage( request, response ) {
        var cart = {};
        var cartTally;

        if ( request.cookies[ CART_COOKIE_NAME ] ) {
            cart = JSON.parse( request.cookies[ 'PlasticPages_cart' ] );
        }

        getCatalog( function( ) {
            cartTally = tallyCart( cart );

            response.render( 'cart', {
                baseUrl: baseUrl,
                lineItems: cartTally.lineItems,
                shipping: cartTally.shipping,
                total: cartTally.total
            } );
        } );
    }

    //=========================================================================

    function doCheckoutPage( request, response ) {
        response.render( 'checkout', {
            baseUrl: baseUrl
        } );
    }

    //=========================================================================

    function doOrderPage( request, response ) {
        var cart = {};
        var customerName, customerAddress;
        var cartTally;

        if ( request.cookies[ CART_COOKIE_NAME ] ) {
            cart = JSON.parse( request.cookies[ 'PlasticPages_cart' ] );
        }
        customerName = request.body.name;
        customerAddress = request.body.address;

        getCatalog( function( ) {
            cartTally = tallyCart( cart );
            response.cookie( CART_COOKIE_NAME, JSON.stringify( {} ) );

            response.render( 'order', {
                baseUrl: baseUrl,
                customerName: customerName,
                addressLines: customerAddress.split( '\n' ),
                lineItems: cartTally.lineItems,
                shipping: cartTally.shipping,
                total: cartTally.total
            } );
        } );
    }

    //=========================================================================

    function findItem( id ) {
        return items[ id ];
    }

    //-------------------------------------------------------------------------

    function tallyCart( cart ) {
        var itemId, item, quantity, linePrice;
        var lineItems = [];
        var shipping;
        var total = 0;

        for ( itemId in cart ) {
            item = findItem( itemId );
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
