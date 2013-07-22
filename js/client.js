'use strict';

var app = angular.module('mopidyWebClient', []);

var mopidy = Mopidy();
//mopidy.on(console.log.bind(console));
var online = false;
mopidy.on('state:online', function() {
  online = true;
  bootstrap();
});

var consoleError = console.error.bind(console);
var mkTlTrack = function(track) {
  delete track['$$hashKey'];
  var tl_track = {
    '__model__': 'TlTrack',
    'track': track
  };
  return tl_track;
};

var ACCUMULATE_TO_PLAYLIST = 'The Marketing Lab';

function bootstrap() {
  if ( typeof(ACCUMULATE_TO_PLAYLIST) !== 'undefined' ) {
    console.log("Getting accumulator...");
    mopidy.playlists.getPlaylists().then(function(data) {
      var playlist;
      for ( var i in data ) {
        playlist = data[i];
        console.log(playlist.name);
        if ( playlist.name == ACCUMULATE_TO_PLAYLIST ) {
          ACCUMULATE_TO_PLAYLIST = playlist;
          break;
        }
      }
      if ( typeof(ACCUMULATE_TO_PLAYLIST) == 'object' && '__model__' in ACCUMULATE_TO_PLAYLIST && ACCUMULATE_TO_PLAYLIST.__model__ == 'Playlist' ) {
        console.log("Found accumulator");
      }
      else {
        console.error("Couldn't find accumulator");
      }
    });
  }
}
