/* Web site for UW HTML5 APIs course */

var express = require( 'express' );
var favicon = require( 'serve-favicon' );
var logfmt = require( 'logfmt' );
var compression = require( 'compression' );
var bodyParser = require( 'body-parser' );
var cookieParser = require( 'cookie-parser' );
var socketio = require( 'socket.io' );
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

var socketChatDir = './server/Examples/SocketChat/';
var socketChat = require( socketChatDir + 'SocketChatServer' );

var appCacheDemoDir = './server/Examples/AppCache/';
var appCacheDemo = require( appCacheDemoDir + 'AppCacheServer' )(
    express, appCacheDemoDir );

//=============================================================================

app.use( favicon( __dirname + '/public/favicon.ico' ) );
app.use( logfmt.requestLogger() );
app.use( compression() );
app.use( bodyParser.urlencoded( { extended: false } ) );
app.use( cookieParser() );
app.use( express.static( __dirname + '/public/' ) );

app.use( '/Examples/PlasticPages/', plasticPages );
app.use( '/Examples/PlasticAjax/', plasticAjax );
app.use( '/Examples/AppCache/', appCacheDemo );

var port = Number( process.env.PORT || 6221 );
var server = app.listen( port,
                         function( )
                         {
                             console.log( "Listening on port " + port );
                         } );

var io = socketio( server );
io.on(
    'connection',
    function( socket ) {
        socketChat.handleConnection( io, socket );
    } );

