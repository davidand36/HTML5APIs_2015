/*
  PlasticPages.js
  David M. Anderson

  Middleware for PlasticPages Web site
*/

var plasticPages = function( express, app, baseDir ) {

    var router = express.Router();
    var handlebars = require( 'express-handlebars' );

    //=========================================================================

    var viewsDir = baseDir + 'views/';
    app.set( 'views', viewsDir );
    app.engine( '.handlebars', handlebars( {
        layoutsDir: viewsDir + 'layouts',
        defaultLayout: 'main'
    } ) );
    app.set( 'view engine', 'handlebars' );

    //-------------------------------------------------------------------------

    router.get( '/', doHomePage );
    router.get( '/catalog/:page', doCatalogPage );

    //=========================================================================

    function doHomePage( request, response ) {
        response.render( 'home.handlebars' );
    }

    //=========================================================================

    function doCatalogPage( request, response ) {
        response.send( 'Catalog page ' + request.params.page );
    }

    //=========================================================================

    return router;
};

//=============================================================================

module.exports = plasticPages;


//*****************************************************************************
