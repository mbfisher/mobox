'use strict';

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
