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

var baseUrl = window.location.pathname;
var pageSize = 4;
var numPages;
var catalogSize;
var catalogPages = [];

//-----------------------------------------------------------------------------

start( );

//=============================================================================

function start( ) {
    setEventHandlers( );
    showHome( );
    Handlebars.registerHelper( 'paginator', paginator );

    //-------------------------------------------------------------------------

    function setEventHandlers( ) {
        $('body').on( 'click', '.homeLink', doHome );
        $('body').on( 'click', '.catalogLink', doCatalog );
        $('body').on( 'click', '.itemLink', doItem );

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
    }
}

//=============================================================================

function showHome( ) {
    $('main').html( homeTemplate() );
}

//=============================================================================

function showCatalogPage( page ) {
    getCatalogSize( )
        .then( getCatalogPage )
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
    
    //-------------------------------------------------------------------------

    function getCatalogSize( ) {
        var deferred;
        if ( catalogSize ) {
            deferred = $.Deferred();
            deferred.resolve( catalogSize );
            return deferred.promise();
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

    //-------------------------------------------------------------------------

    function getCatalogPage( ) {
        var deferred;
        if ( catalogPages[ page ] ) {
            deferred = $.Deferred();
            deferred.resolve( catalogPages[ page ] );
            return deferred.promise();
        } else {
            return $.getJSON( baseUrl + 'catalog',
                          {
                              offset: page * pageSize,
                              limit: pageSize
                          } )
                .then(
                    function( response ) {
                        catalogPages[ page ] = response;
                        return response;
                    },
                    function( error ) {
                        console.error( 'Error getting catalog list', error );
                    }
                );
        }
    }

}
//=============================================================================

function showItemPage( itemId ) {
    var item = findItem( itemId );
    $('main')
        .html( itemTemplate( item ) );

    //-------------------------------------------------------------------------

    function findItem( itemId ) {
        var p, numPages, catPage,
            i, len, item;
        for ( p = 0, numPages = catalogPages.length; p < numPages; ++p ) {
            catPage = catalogPages[ p ];
            if ( catPage ) {
                for ( i = 0, len = catPage.length; i < len; ++i ) {
                    item = catPage[ i ];
                    if ( item.id === itemId ) {
                        return item;
                    }
                }
            }
        }
        return null;
    }
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


//=============================================================================
} )();
