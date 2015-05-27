/*
  SocketChatServer.js
  David M. Anderson

  Server side of Web Socket (socket.io) chat app
*/

//=============================================================================

function handleConnection( io, socket ) {
    console.log( 'New SocketChat connection' );

    socket.on( 'join', handleJoin );
    socket.on( 'chat', handleChat );
    socket.on( 'disconnect', handleDisconnect );

    //-------------------------------------------------------------------------

    function handleJoin( data ) {
        var userName = data;
        console.log( userName + ' joined' );
        socket.userName = userName;
        io.emit( 'chat',                //sent to everyone
                 {
                     user: 'SocketChat',
                     message: userName + ' has joined.'
                 }
               );
        socket.emit( 'chat',            //sent to user
                     {
                         user: 'SocketChat',
                         message: 'Welcome, ' + userName + '.'
                     }
                   );
    }

    //-------------------------------------------------------------------------

    function handleChat( message ) {
        console.log( 'Chat message from ' + socket.userName + ': ' +
                     message );
        socket.broadcast.emit( 'chat',  //sent to everyone else
                               {
                                   user: socket.userName,
                                   message: message
                               } );
    }

    //-------------------------------------------------------------------------

    function handleDisconnect( ) {
        console.log( socket.userName + ' disconnected' );
        io.emit( 'chat',                //sent to everyone (else)
                 {
                     user: 'SocketChat',
                     message: socket.userName + ' has left.'
                 } );
    }
}

//=============================================================================

module.exports = {
    handleConnection: handleConnection
};

//=============================================================================
