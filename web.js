/* Web site for UW HTML5 APIs course */

var express = require( 'express' );
var favicon = require( 'serve-favicon' );
var logfmt = require( 'logfmt' );
var compression = require( 'compression' );
var bodyParser = require( 'body-parser' );
var cookieParser = require( 'cookie-parser' );
var app = express();

var plasticDataDir = './server/Examples/Plastic/';
var plasticPagesDir = './server/Examples/PlasticPages/';
var plasticPagesViewsDir = plasticPagesDir + 'views/';
var plasticPagesBaseUrl = '/Examples/PlasticPages/';
var plasticPages = require( plasticPagesDir + 'PlasticPages' )(
    express, app,
    plasticPagesViewsDir, plasticDataDir, plasticPagesBaseUrl );
var plasticAjaxDir = './server/Examples/PlasticAjax/';
var plasticAjaxBaseUrl = '/Examples/PlasticAjax/';
var plasticAjax = require( plasticAjaxDir + 'PlasticAjaxServer' )(
    express, plasticDataDir, plasticAjaxBaseUrl );

//=============================================================================

app.use( favicon( __dirname + '/public/favicon.ico' ) );
app.use( logfmt.requestLogger() );
app.use( compression() );
app.use( bodyParser.urlencoded( { extended: false } ) );
app.use( bodyParser.json( ) );
app.use( cookieParser() );
app.use( express.static( __dirname + '/public/' ) );

app.use( '/Examples/PlasticPages/', plasticPages );
app.use( '/Examples/PlasticAjax/', plasticAjax );

app.use( getRequestData );
app.use( echoRequestData );

var port = Number( process.env.PORT || 6221 );
app.listen( port,
            function( )
            {
                console.log( "Listening on port " + port );
            } );

//=============================================================================

// These functions gather and echo data posted from the client (if any).
// That is good for experimenting with forms, AJAX, etc.
// For more useful form handling, particularly parsing of field values,
// use something like https://www.npmjs.org/package/body
// or https://github.com/expressjs/body-parser .

function getRequestData( req, res, next )
{
    req.setEncoding( 'utf8' );
    req.data = '';
    req.on( 'data',
            function( chunk )
            {
                req.data += chunk;
            } );
    req.on( 'end', next );
}

function echoRequestData( req, res, next )
{
    res.setHeader( 'content-type', 'text/plain' );
    res.end( req.data );
    console.log( 'Request data: ' + req.data );
}
