'use strict';

var app = angular.module('mopidyWebClient', []);
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

function playbackController($scope, $tracklist) {
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

function searchController($scope, $tracklist) {
  function setResult(result) {
    $scope.result = result;
    $tracklist.updateTracks(result.tracks, 'searchController::setResult');
    $scope.$apply();
    return result;
  };

  $scope.search = function() {
    var self = this;
    if ( self.query ) {
      mopidy.library.search({'any':self.query}).then(function(data) {
        console.log(data);
        for ( var i in data ) {
          if ( data[i].uri.indexOf('spotify:search') === 0 ) {
            console.log(setResult(data[i]));
            break;
          }
        }
      });
    }
  };

  $scope.setTracklistAlbum = function(uri) {
    mopidy.library.lookup(uri).then(function(data) {
      console.log($tracklist.updateTracks(data, 'searchController::setTracklistAlbum'));
    });
  };

  $scope.setTracklistArtist = function(artist_name) {
    var a;
    var album;
    var albums = [];
    for ( a in $scope.result.albums.slice(0,10) ) {
      album = $scope.result.albums[a];
      if ( album.artists[0].name = artist_name ) {
        albums.push(album);
      }
    }
    var tracks = [];
    var done = albums.length;
    var i = 0;
    for ( a in albums ) {
      album = albums[a];
      mopidy.library.lookup(album.uri).then(function(data) {
        tracks = tracks.concat(data);
        i++;
        console.log('Checking done', i, done);
        if ( i >= done ) {
          console.log('Done; emitting [updateTracklistArtist]');
          $scope.$emit('updateTracklistArtist', tracks);
        }
      });
    }
  };
  $scope.$on('updateTracklistArtist', function(event, tracks) {
    console.log('Received [updateTracklistArtist]');
    console.log($tracklist.updateTracks(tracks, 'searchController::setTracklistArtist'));
  });
};

function libraryController($scope, $tracklist) {
  var setPlaylists = function(playlists) {
    $scope.playlists = playlists;
    $scope.$apply();
  };

  var getPlaylists = function() {
    mopidy.playlists.getPlaylists().then(function(data) {
      setPlaylists(data);
    }, consoleError);
  };

  function bootstrap() {
    getPlaylists();
  }

  $scope.showPlaylist = function(playlist) {
    console.log($tracklist.updateTracks(playlist.tracks, 'libraryController'));
  };

  mopidy.on('event:playlistsLoaded', function() {
    getPlaylists();
  });


  var int = window.setInterval(function() {
    if ( online ) {
      bootstrap();
      window.clearInterval(int);
    }
  }, 500);
}

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





