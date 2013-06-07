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
