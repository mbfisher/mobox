'use strict';

var consoleError = console.error.bind(console);
var config;
var app;
var mopidy;
var online;

$.ajax('/config.json', {async: false}).done(function(data) {
  config = data;
});

app = angular.module('mopidyWebClient', ['filters']);
app.config(['$routeProvider', '$locationProvider',  function ($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {templateUrl: 'partials/queue.html', controller: QueueController })
    .when('/queue', {templateUrl: 'partials/queue.html', controller: QueueController })
    .when('/playlists', {templateUrl: 'partials/playlists.html', controller: PlaylistsController})
    .when('/search', {templateUrl: 'partials/search.html', controller: SearchController})
    .otherwise({redirectTo: '/'});
  $locationProvider.html5Mode(true);
}]);

angular.module('filters', []).filter('truncate', function () {
  return function (text, length, end) {
    if (isNaN(length)) length = 30;

    if (end === undefined) end = "...";

    if (text.length <= length || text.length - end.length <= length) {
      return text;
    }
    else {
      return String(text).substring(0, length-end.length) + end;
    }
  };
});

mopidy = Mopidy(config.mopidy);

//mopidy.on(console.log.bind(console));
online = false;
mopidy.on('state:online', function() {
  online = true;
  bootstrap();
});

function bootstrap() {
  $('#connecting').hide();
  $('#app').show();
  /* if ( typeof(ACCUMULATE_TO_PLAYLIST) !== 'undefined' ) {
    console.log("Getting accumulator...");
    mopidy.playlists.getPlaylists().then(function(data) {
      var playlist;
      for ( var i in data ) {
        playlist = data[i];
        console.log(playlist.name);
        if ( playlist.name == ACCUMULATE_TO_PLAYLIST ) {
          ACCUMULATE_TO_PLAYLIST = playlist;
          break;
        }
      }
      if ( typeof(ACCUMULATE_TO_PLAYLIST) == 'object' && '__model__' in ACCUMULATE_TO_PLAYLIST && ACCUMULATE_TO_PLAYLIST.__model__ == 'Playlist' ) {
        console.log("Found accumulator");
      }
      else {
        console.error("Couldn't find accumulator");
      }
    });
  }*/
}
