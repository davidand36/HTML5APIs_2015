/*
  AppCacheClient.js
  David M. Anderson

  Client-side script for AppCache demo
*/

(function() {
'use strict';

//=============================================================================

var clientTime = new Date();
var text = 'The time on this computer is ' + clientTime.toString() + '<br />' +
        serverTimeString;
$('main').html( text );

//=============================================================================
})();
