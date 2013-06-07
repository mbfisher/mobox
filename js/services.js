'use strict';

app.factory('$tracklist', function($rootScope) {
  var $tracklist = {};

  $tracklist.tracks = [];

  $tracklist.updateTracks = function(tracks, initiator) {
    this.tracks = tracks;
    this.broadcast(initiator);
    return this.tracks;
  };

  $tracklist.broadcast = function(initiator) {
    console.log('$tracklist broadcasting [updateTracklist] from', initiator);
    $rootScope.$broadcast('updateTracklist');
  };

  return $tracklist;
});
app.factory('$plackback', function($rootScope) {
  var $playback;

  $playback.state = '';

  $playback.updateState = function(state, initiator) {
    this.state = state;
    this.broadcat(initiator);
    return this.state;
  };

  $playback.broadcast = function(initiator) {
    console.log('$playback broadcasting [updateState] from', initiator);
    $rootScope.$broadcast('updateState');
  };

  return $playback;
});
