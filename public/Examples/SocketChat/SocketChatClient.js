/*
  SocketChatClient.js
  David M. Anderson

  Client side of Web Socket (socket.io) chat app
*/

(function() {
'use strict';

//=============================================================================

var signInHtml = $('#signInTemplate').html();
var chatRoomHtml = $('#chatRoomTemplate').html();

var socket = io.connect( ); //global provided by socket.io client
var baseUrl = window.location.pathname;
var userName = '';

//-----------------------------------------------------------------------------

start( );

//=============================================================================

function start( ) {
    showSignIn( );
}

//=============================================================================

function showSignIn( ) {
    $('main').html( signInHtml );
    $('#signInButton').on( 'click', signIn );
}
//-----------------------------------------------------------------------------

function signIn( evt ) {
    evt.preventDefault();
    userName = $('#name').val();
    if ( userName.length > 0 ) {
        socket.emit( 'join', userName );
        showChatRoom( );
    }
}

//=============================================================================

function showChatRoom( ) {
    $('main').html( chatRoomHtml );
    $('#sendMessageButton').on( 'click', sendMessage );
    socket.on( 'chat', handleChat );
}

//-----------------------------------------------------------------------------

function sendMessage( evt ) {
    evt.preventDefault();
    var message = $('#message').val();
    $('#message').val( '' );
    socket.emit( 'chat', message );
    displayMessage( userName, message, true );
}

//-----------------------------------------------------------------------------

function handleChat( data ) {
    displayMessage( data.user, data.message, false );
}

//-----------------------------------------------------------------------------

function displayMessage( user, message, fromMe ) {
    var item = $('<li><b>' + user + ':</b> ' + message + '</li>');
    if ( fromMe ) {
        item.addClass( 'from-me' );
    }
    $('#messages').prepend( item );
}

//=============================================================================
})();
