'use strict';

app.factory('$queue', function($rootScope) {
  var $queue = {};

  $queue.tracks = [];

  $queue.update = function() {
    mopidy.tracklist.getTracks().then(function(data) {
      $queue.tracks = data;
      $rootScope.$broadcast('queueUpdated');
    });
  };

  $queue.add = function(tracks) {
    var tracks = tracks instanceof Object ? [tracks] : tracks;
    mopidy.tracklist.add(angular.fromJson(angular.toJson(tracks))).then(function() {
      alert('Added!');
      $queue.update();
    }, consoleError);
  };

  $rootScope.addToQueue = $queue.add;

  return $queue;
});
