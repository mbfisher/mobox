'use strict';

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
