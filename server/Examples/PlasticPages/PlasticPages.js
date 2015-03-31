/*
  PlasticPages.js
  David M. Anderson

  Middleware for PlasticPages Web site
*/

module.exports = function( express, app, baseDir, publicDir ) {

    var router = express.Router();
    var viewsDir = baseDir + 'views/';
    var handlebars = require( 'express-handlebars' )( {
        layoutsDir: viewsDir + 'layouts',
        defaultLayout: 'main'
    } );
    var fs = require( 'fs' );

    //=========================================================================

    app.set( 'views', viewsDir );
    app.engine( '.handlebars', handlebars );
    app.set( 'view engine', 'handlebars' );

    //-------------------------------------------------------------------------

    router.get( '/', doHomePage );
    router.get( '/catalog/:page', doCatalogPage );
    router.get( '/item/:itemId', doItemPage );

    //=========================================================================

    var catalog;

    //-------------------------------------------------------------------------

    function getCatalog( callback ) {
        var catalogPath = baseDir + 'Catalog.json';
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
                        item.imageUrl = publicDir + 'images/' + item.image;
                        item.thumbUrl = publicDir + 'images/' + item.thumbnail;
                    }
                    callback( catalog );
                }
            } );
        }
    }

    //=========================================================================

    function doHomePage( request, response ) {
        response.render( 'home', {
            publicDir: publicDir
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
                publicDir: publicDir,
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
                html += '<li><a href="' + pageUrl + i + '">' + i + '</a></li>';
            }
        }
        html += '</ul>';
        return html;
    }

    //=========================================================================

    function doItemPage( request, response ) {
        getCatalog( function( ) {
            var itemId = Number( request.params.itemId );
            var item = findItem( itemId );
            response.render( 'item', {
                publicDir: publicDir,
                name: item.name,
                description: item.description,
                imageUrl: item.imageUrl,
                price: item.price
            } );
        } );
    }

    //-------------------------------------------------------------------------

    function findItem( id ) {
        for ( var i = 0, len = catalog.length; i < len; ++i ) {
            if ( catalog[ i ].id === id ) {
                return catalog[ i ];
            }
        }
        return null;
    }

    //=========================================================================

    return router;
};


//*****************************************************************************
