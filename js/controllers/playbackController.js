'use strict';

function playbackController($scope, $tracklist) {
  $scope.progressToTime = function(progress) {
    progress = progress / 1000;
    var m = Math.floor(progress /60);
    var s = Math.floor(progress % 60);
    if ( s < 10 ) {
      s = '0'+s;
    }
    return m+':'+s;
  };
  var setCurrentProgress = function(progress) {
    $scope.currentProgress = $scope.progressToTime(progress);
    $scope.$apply();
    return $scope.currentProgress;
  };
  var int = window.setInterval(function() {
    if ( online && $scope.state == 'playing' ) {
      mopidy.playback.getTimePosition().then(function(data) {
        console.log(setCurrentProgress(data));
      });
    }
  }, 1000);

  var setCurrentTrack = function(track) {
    $scope.currentTrack = track;
    $scope.$apply();
    return track;
  };

  var setState = function(new_state) {
    $scope.state = new_state;
    $scope.$apply();
    return new_state;
  }

  $scope.next = function() {
    mopidy.playback.next();
  };
  $scope.play = function() {
    mopidy.playback.play();
  };
  $scope.pause = function() {
    mopidy.playback.pause();
  };
  $scope.previous = function() {
    mopidy.playback.previous();
  };
  $scope.stop = function() {
    mopidy.playback.stop();
  };

  $scope.showTracklist = function() {
    mopidy.tracklist.getTracks().then(function(data) {
      console.log($tracklist.updateTracks(data, 'playbackController::showTracklist'));
    });
  };

  mopidy.on('event:trackPlaybackStarted', function(data) {
    console.log(setCurrentTrack(data.tl_track.track));
  }, consoleError);

  mopidy.on('event:playbackStateChanged', function(data) {
    console.log(setState(data.new_state));
  }, consoleError);

  var bootstrap = function() {
    mopidy.playback.getCurrentTrack().then(setCurrentTrack, consoleError);
    mopidy.playback.getState().then(setState, consoleError);
  };

  var int = window.setInterval(function() {
    if ( online ) {
      bootstrap();
      window.clearInterval(int);
    }
  }, 500);
};
