/*
  HTML5_Lectures.js
  David M. Anderson

  Functions for my lectures on HTML5 APIs
*/

(function() {
//*****************************************************************************

'use strict';

//=============================================================================

setupAccordions( );
setupAccordionToggle( );
setupDemos( );
setupCanvasDemos( );
setupAudioDemos( );

//=============================================================================

function setupAccordions( ) {
    $('div.accordion').accordion( {
        heightStyle: 'content'
    } );

    $('div.accordion.h1').accordion( 'option', 'header', 'h1' );
    $('div.accordion.h2').accordion( 'option', 'header', 'h2' );
    $('div.accordion.h3').accordion( 'option', 'header', 'h3' );
    $('div.accordion.h4').accordion( 'option', 'header', 'h4' );
    $('div.accordion.h5').accordion( 'option', 'header', 'h5' );
    
    $('div.accordion.h1').accordion( 'option', 'active', 0 );
}

//-----------------------------------------------------------------------------

function setupAccordionToggle( ) {
    var buttonTexts = {
        expand: "Expand sections",
        collapse: "Collapse sections"
    };
    $('#accordionToggle').text( buttonTexts.expand );
    $('#accordionToggle').click(
        function( event ) {
            var target = $(event.target),
                txt = target.text();
            if ( txt === buttonTexts.expand ) {
                $('.accordion').accordion( 'destroy' );
                target.text( buttonTexts.collapse );
            } else {
                setupAccordions( );
                target.text( buttonTexts.expand );
            }
        }
    );
}

//=============================================================================

function getCode( parent ) {
    var pre = $(parent).find( 'pre' ),
        code = pre.text();
    return code.replace( /<\/?b>/, '' ).replace( /&lt;/, '<' ).replace( /&gt;/, '>' );
}

//-----------------------------------------------------------------------------

function setupDemos( ) {
    $('button.runCode').click(
        function( evt ) {
            var parent = $(evt.target).parent(),
                code = getCode( parent );
            eval( code );
        } );
}

//-----------------------------------------------------------------------------

function setupCanvasDemos( ) {
    $('button.runCanvasCode').click(
        function( evt ) {
            var parent = $(evt.target).parent(),
                code = getCode( parent ),
                canvas = $(parent).find( 'canvas' )[0],
                ctx = canvas.getContext( '2d' );
            ctx.save( );
            eval( code );
            ctx.restore( );
        } );

    $('button.clearCanvas').click(
        function( evt ) {
            var parent = $(evt.target).parent(),
                canvas = $(parent).find( 'canvas' )[0],
                ctx = canvas.getContext( '2d' );
            ctx.clearRect( 0, 0, canvas.width, canvas.height );
        } );
}

//-----------------------------------------------------------------------------

function getBestFormat( medium, formats ) {
    var responses = [ 'probably', 'maybe' ];
    var element = document.createElement( medium ),
        r, numResponses = responses.length, response,
        f, numFormats = formats.length, format,
        answer;

    for ( r = 0; r < numResponses; ++r ) {
        response = responses[ r ];
        for ( f = 0; f < numFormats; ++f ) {
            format = formats[ f ];
            answer = element.canPlayType( format.mime );
            if ( answer === response ) {
                return format.ext;
            }
        }
    }
    return null;
}

//.............................................................................

function getBestAudioFormat( ) {
    var formats = [
        { ext: 'ogg', mime: 'audio/ogg; codecs="vorbis"' },
        { ext: 'mp3', mime: 'audio/mpeg' }
    ];
    return getBestFormat( 'audio', formats );
}

//.............................................................................

function getBestVideoFormat( ) {
    var formats = [
        { ext: 'webm', mime: 'video/webm' },
        { ext: 'mp4', mime: 'video/mp4' }
    ];
    return getBestFormat( 'video', formats );
}

//.............................................................................

function setupAudioDemos( ) {
    var soundNames = [ 'computer', 'asaying', 'hatecomp',
                       'Diane_Nalini_Kiss_me_like_that', 'maketenlouder',
                       "Ella_Fitzgerald_Let's_Do_It_(Let's_Fall_in_Love)",
                       'fw11', 'pcloadletter' ],
        sounds = { },
        audio,
        i, lim;

    var audioFormat = getBestAudioFormat( );
    var videoFormat = getBestVideoFormat( );

    for ( i = 0, lim = soundNames.length; i < lim; ++i ) {
        audio = new Audio( 'audio/' + soundNames[ i ] + '.' + audioFormat );
        sounds[ soundNames[ i ] ] = audio;
    }
    
    $('button.runAudioCode').click(
        function( evt ) {
            var parent = $(evt.target).parent(),
                code = getCode( parent );
            eval( code );
        } );

    $('button.stopAudio').click(
        function( evt ) {
            var i, lim;
            for ( i = 0, lim = soundNames.length; i < lim; ++i ) {
                sounds[ soundNames[ i ] ].pause( );
                sounds[ soundNames[ i ] ].currentTime = 0;
            }
        } );
}

//*****************************************************************************
})();
