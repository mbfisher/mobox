'use strict';

app.factory('$queue', function($rootScope) {
  var $queue = {};

  $queue.tracks = [];

  $queue.refresh = function(callback) {
    mopidy.tracklist.getTlTracks().then(function(tltracks) {
      $.ajax('/db/plays', {
        type: 'GET',
        success: function(data) {
          var again = false;
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
              again = true;
            }
            tltracks[i].track = track;
          }
          $queue.tracks = tltracks;

          if ( typeof callback !== 'undefined' ) callback();

          $rootScope.$broadcast('queueUpdated');
        },
        error: function(data) {
          alert(data.error);
        }
      });
    });
  };

  $queue.add = function(tracks) {
    var tracks = tracks instanceof Array ? tracks : [tracks];
    for ( var i in tracks ) {
      delete tracks[i].queued_by;
    }
    mopidy.tracklist.add(angular.fromJson(angular.toJson(tracks))).then(function() {
      for ( var i in tracks ) {
        var track = tracks[i];
        $.ajax('/db/plays', {
          type: 'POST',
          data: { user: cookie.user, uri: track.uri },
          error: function(data) { alert(data.error); }
        });
      }
      alert('Added!');
      $queue.refresh();
    }, consoleError);
  };

  $rootScope.addToQueue = $queue.add;

  return $queue;
});
