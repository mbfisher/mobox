'use strict';

var app = angular.module('mopidyWebClient', []);

var mopidy = Mopidy();
mopidy.on(console.log.bind(console));
var online = false;
mopidy.on('state:online', function() {
  online = true;
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
