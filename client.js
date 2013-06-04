'use strict';

var app = angular.module('mopidyWebClient', []);

var mopidy = Mopidy();
mopidy.on(console.log.bind(console));
var online = false;
mopidy.on('state:online', function() {
  online = true;
});

var consoleError = console.error.bind(console);

function playbackController($scope) {
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

function searchController($scope) {
  function setResult(result) {
    $scope.result = result;
    $scope.$apply();
    return result;
  };
  var changeTlTrack = function(tl_tracl) {
    mopidy.playback.changeTrack(tl_track).then(function() {
      console.log('Track changed');
    }, consoleError);
  };

  $scope.search = function() {
    var self = this;
    if ( self.query ) {
      mopidy.library.search({'any':self.query}).then(function(data) {
        console.log(setResult(data[0]));
      });
    }
  };

  $scope.changeTrack = function(track) {
    delete track['$$hashKey'];
    var tl_track = {
      '__model__': 'TlTrack',
      'track': track
    };
    return changeTlTrack(tl_track);
  };
};

