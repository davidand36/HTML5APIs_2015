/*
  PlasticAjaxClient.js
  David M. Anderson

  Client-side code for PlasticAjax Web site
*/

(function() {
'use strict';

//=============================================================================

var homeTemplate = Handlebars.compile( $('#homeTemplate').html() );
var catalogTemplate = Handlebars.compile( $('#catalogTemplate').html() );
var itemTemplate = Handlebars.compile( $('#itemTemplate').html() );
var cartTemplate = Handlebars.compile( $('#cartTemplate').html() );
var checkoutTemplate = Handlebars.compile( $('#checkoutTemplate').html() );
var orderTemplate = Handlebars.compile( $('#orderTemplate').html() );

var baseUrl = window.location.pathname;
var pageSize = 4;
var numPages;
var catalogSize;
var catalogPages = [];
var items = {};
var CART_STORAGE_NAME = 'PlasticAjax_cart';

//-----------------------------------------------------------------------------

start( );

//=============================================================================

function start( ) {
    setEventHandlers( );
    showHome( );
    Handlebars.registerHelper( 'paginator', paginator );
    Handlebars.registerPartial( 'cartTable', $('#cartTablePartial').html() );

    //-------------------------------------------------------------------------

    function setEventHandlers( ) {
        $('body').on( 'click', '.homeLink', doHome );
        $('body').on( 'click', '.catalogLink', doCatalog );
        $('body').on( 'click', '.itemLink', doItem );
        $('body').on( 'click', '.cartLink', doCart );
        $('body').on( 'click', '.cartAddLink', doAddToCart );
        $('body').on( 'click', '.checkoutLink', doCheckout );
        $('body').on( 'click', '.orderLink', doOrder );

        //---------------------------------------------------------------------

        function doHome( evt ) {
            showHome( );
            evt.preventDefault();
        }

        //---------------------------------------------------------------------

        function doCatalog( evt ) {
            var page = Number( $(evt.currentTarget).attr( 'data-id' ) ) || 0;
            showCatalogPage( page );
            evt.preventDefault();
        }

        //---------------------------------------------------------------------

        function doItem( evt ) {
            var itemId = $(evt.currentTarget).attr( 'data-id' );
            showItemPage( itemId );
            evt.preventDefault();
        }

        //---------------------------------------------------------------------

        function doCart( evt ) {
            showCartPage( );
            evt.preventDefault();
        }

        //---------------------------------------------------------------------

        function doAddToCart( evt ) {
            var itemId = $(evt.currentTarget).attr( 'data-id' );
            showAddToCartPage( itemId );
            evt.preventDefault();
        }

        //---------------------------------------------------------------------

        function doCheckout( evt ) {
            showCheckoutPage( );
            evt.preventDefault();
        }

        //---------------------------------------------------------------------

        function doOrder( evt ) {
            showOrderPage( );
            evt.preventDefault();
        }
    }
}

//=============================================================================

function showHome( ) {
    $('main').html( homeTemplate() );
}

//=============================================================================

function showCatalogPage( page ) {
    getCatalogSize( )
        .then(
            function( ) {
                return getCatalogPage( page );
            }
        )
        .then(
            function( items ) {
                if ( ! numPages ) {
                    numPages = Math.ceil( catalogSize / pageSize );
                }
                $('main')
                    .html( catalogTemplate( {
                        items: items,
                        numPages: numPages,
                        curPage: page
                    } ) );
            }
        );
}

//=============================================================================

function showItemPage( itemId ) {
    getItem( itemId )
        .then(
            function( item ) {
                $('main')
                    .html( itemTemplate( item ) );
            }
        );
}

//=============================================================================

function showCartPage( ) {
    var cart = {};

    if ( localStorage[ CART_STORAGE_NAME ] ) {
        cart = JSON.parse( localStorage[ CART_STORAGE_NAME ] );
    }

    tallyCart( cart )
        .then(
            function( cartTally ) {
                $('main')
                    .html( cartTemplate( {
                        cartEmpty: (cartTally.lineItems.length === 0),
                        lineItems: cartTally.lineItems,
                        shipping: cartTally.shipping,
                        total: cartTally.total
                    } ) );
            }
        );
}

//-----------------------------------------------------------------------------

function showAddToCartPage( itemId ) {
    var cart = {};
    if ( localStorage[ CART_STORAGE_NAME ] ) {
        cart = JSON.parse( localStorage[ CART_STORAGE_NAME ] );
    }
    if ( cart[ itemId ] ) {
        ++cart[ itemId ];
    } else {
        cart[ itemId ] = 1;
    }
    localStorage[ CART_STORAGE_NAME ] = JSON.stringify( cart );

    showCartPage( );
}

//=============================================================================

function showCheckoutPage( ) {
    $('main').html( checkoutTemplate() );
}


//=============================================================================

function showOrderPage( ) {
    var formData = $('#orderForm').serializeArray( );
    var cart = {};
    if ( localStorage[ CART_STORAGE_NAME ] ) {
        var cart = JSON.parse( localStorage[ CART_STORAGE_NAME ] );
    }
    formData.push( { name: 'cart', value: JSON.stringify( cart ) } );

    $.post( baseUrl + 'order',
            formData,
            'json' )
        .then(
            function( response ) {
                var templateData = JSON.parse( response );
                $('main').html( orderTemplate( templateData ) );
                localStorage.removeItem( CART_STORAGE_NAME );
            },
            function( error ) {
                console.log( 'Error submitting order', error );
            }
        );
}

//=============================================================================

function getCatalogSize( ) {
    if ( catalogSize ) {
        return $.when( catalogSize );
    } else {
        return $.getJSON( baseUrl + 'catalog',
                          {
                              getSize: true
                          } )
            .then(
                function( response ) {
                    catalogSize = response;
                    return response;
                },
                function( error ) {
                    console.error( 'Error getting catalog size', error );
                }
            );
    }
}

//-----------------------------------------------------------------------------

function getCatalogPage( page ) {
    if ( catalogPages[ page ] ) {
        return $.when( catalogPages[ page ] );
    } else {
        return $.getJSON( baseUrl + 'catalog',
                          {
                              offset: page * pageSize,
                              limit: pageSize
                          } )
            .then(
                function( response ) {
                    var i, len, item;
                    catalogPages[ page ] = response;
                    for ( i = 0, len = response.length; i < len; ++i ) {
                        item = response[ i ];
                        items[ item.id ] = item;
                    }
                    return response;
                },
                function( error ) {
                    console.error( 'Error getting catalog list', error );
                }
            );
    }
}

//-----------------------------------------------------------------------------

function getItem( itemId ) {
    if ( items[ itemId ] ) {
        return $.when( items[ itemId ] );
    } else {
        return $.getJSON( baseUrl + 'item',
                          {
                              itemId: itemId
                          } )
            .then(
                function( response ) {
                    items[ itemId ] = response;
                    return response;
                },
                function( error ) {
                    console.error( 'Error getting item', error );
                }
            );
    }
}

//==============================================================================

function tallyCart( cart ) {
    var deferred = $.Deferred();
    var itemPromises = [];
    var itemId, item, quantity, linePrice;
    var lineItems = [];
    var shipping;
    var total = 0;

    for ( itemId in cart ) {
        itemPromises.push( getItem( itemId ) );
    }
    whenAll( itemPromises )
        .then(
            function( ) {
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

                deferred.resolve( {
                    lineItems: lineItems,
                    shipping: centsToDollars( shipping ),
                    total: centsToDollars( total, true )
                } );
            },
            function( error ) {
                deferred.reject( error );
            }
        );
    return deferred;
}

//-----------------------------------------------------------------------------

function centsToDollars( cents, withSign ) {
    var pre = withSign  ?  '$'  :  '';
    return pre + (cents / 100).toFixed( 2 );
}

//==============================================================================

function paginator( numPages, curPage, linkClass ) {
    var html = '<ul class="paginator">';
    //Page numbering is 0-based internally, displayed as 1-based.
    for ( var i = 0; i < numPages; ++i ) {
        if ( i === curPage ) {
            html += '<li><span>' + (i + 1) + '</span></li>';
        } else {
            html += '<li><a class="' + linkClass + '" data-id="' + i +
                '" href="#">' + (i + 1) + '</a></li>';
        }
    }
    html += '</ul>';
    return html;
}

//==============================================================================

//Accepts array of deferreds. Resolves with array of results (or errors).

function whenAll( deferreds )
{
    var deferred = $.Deferred();
    $.when.apply( $, deferreds )
        .then(
            function done( )
            {
                deferred.resolve( Array.prototype.slice.call( arguments ) );
            },
            function fail( )
            {
                deferred.reject( Array.prototype.slice.call( arguments ) );
            }
        );

    return deferred;
}


//=============================================================================
} )();
