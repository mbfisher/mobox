'use strict';

function playlistController($scope, $tracklist) {
  var changeTlTrack = function(tl_track) {
    mopidy.playback.changeTrack(tl_track).then(function() {
      console.log('Track changed');
    }, consoleError);
  };
  var showTracklist  = function() {
    mopidy.tracklist.getTracks().then(function(data) {
      console.log($tracklist.updateTracks(data, 'playlistController::showTracklist'));
    });
  };

  $scope.changeTrack = function(track) {
    return changeTlTrack(mkTlTrack(track));
  };

  $scope.resetTracklist = function(tracks) {
    mopidy.tracklist.clear().then(function() {
      // TODO: Replace hack to remove $$hashKey from tracks
      mopidy.tracklist.add(angular.fromJson(angular.toJson(tracks[0]))).then(function() {
        console.log('Tracklist sent');
        mopidy.playback.play();
      }, consoleError);
    }, consoleError);
  }

  $scope.addToPlaylist = function(track) {
    /*if ( typeof(ACCUMULATE_TO_PLAYLIST) == 'object' && '__model__' in ACCUMULATE_TO_PLAYLIST && ACCUMULATE_TO_PLAYLIST.__model__ == 'Playlist' ) {
      console.log("Adding to accumulator");
      if ( !('tracks' in ACCUMULATE_TO_PLAYLIST) ) {
        ACCUMULATE_TO_PLAYLIST.tracks = [];
      }
      ACCUMULATE_TO_PLAYLIST.tracks.push(track);
      mopidy.playlists.save(ACCUMULATE_TO_PLAYLIST).then(function(data) {
        ACCUMULATE_TO_PLAYLIST = data;
        console.log("Added to accumulator", data);
      }, consoleError);
    }
    else {
      console.log("Skipping accumulator");
    }*/
    mopidy.tracklist.add(angular.fromJson(angular.toJson([track]))).then(function() {
      showTracklist();
    }, consoleError);
  };

  $scope.$on('updateTracklist', function() {
    console.log('playlistController received broadcast [updateTracklist]');
    $scope.tracklist = $tracklist.tracks;
    $scope.$apply();
  });
};
