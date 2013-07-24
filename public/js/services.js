'use strict';

app.factory('$queue', function($rootScope) {
  var $queue = {};

  $queue.tracks = [];

  $queue.update = function() {
    mopidy.tracklist.getTlTracks().then(function(tltracks) {
      $.ajax('/db/plays', {
        type: 'GET',
        success: function(data) {
          for ( var i in tltracks ) {
            var track = tltracks[i].track;
            for ( var j in data ) {
              var play = data[j];
              if ( play.uri == track.uri ) {
                track.queued_by = play.user;
              }
            }
            if ( !('queued_by' in track) ) {
              track.queued_by = 'unknown';
            }
            tltracks[i].track = track;
          }
          $queue.tracks = tltracks;
          $rootScope.$broadcast('queueUpdated');
        }
      });
    });
  };

  $queue.add = function(tracks) {
    var tracks = tracks instanceof Object ? [tracks] : tracks;
    for ( var i in tracks ) {
      delete tracks[i].queued_by;
    }
    mopidy.tracklist.add(angular.fromJson(angular.toJson(tracks))).then(function() {
      for ( var i in tracks ) {
        var track = tracks[i];
        $.ajax('/db/plays', {
          type: 'POST',
          data: { user: cookie.user, uri: track.uri },
          error: console.error
        });
      }
      alert('Added!');
      $queue.update();
    }, consoleError);
  };

  $rootScope.addToQueue = $queue.add;

  return $queue;
});
