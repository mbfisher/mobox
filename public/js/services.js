'use strict';

app.factory('$queue', function($rootScope) {
  var $queue = {};

  var _error = function(response) {
    console.log(response);
    console.error(response.responseText);
    alert('Error: '+response.status+'; see console.');
  }

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
              if ( 'queued_by' in track ) break;
              var play = data[j];
              if ( play.uri == track.uri ) {
                for ( var user in config.mobox.users ) {
                  if ( config.mobox.users[user].indexOf(play.client) > -1 ) {
                    track.queued_by = user;
                    break;
                  }
                }
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
        error: _error
      });
    });
  };

  $queue.add = function(tracks) {
    var tracks = tracks instanceof Array ? tracks : [tracks];
    for ( var i in tracks ) {
      delete tracks[i].queued_by;
      delete tracks[i].source;
    }
    mopidy.tracklist.add(angular.fromJson(angular.toJson(tracks))).then(function() {
      for ( var i in tracks ) {
        var track = tracks[i];
        $.ajax('/db/plays', {
          type: 'POST',
          data: { user: cookie.user, uri: track.uri },
          error: _error,
          success: function() {
            if ( $('.alert.added').css('display') == 'none' ) {
              $('.alert.added').fadeIn(500);
              setTimeout(function() {
                $('.alert.added').fadeOut();
              }, 3000);
            }
          }
        });
      }
      $queue.refresh();
    }, consoleError);
  };

  $rootScope.addToQueue = $queue.add;

  return $queue;
});
