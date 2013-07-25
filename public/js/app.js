'use strict';

var consoleError = console.error.bind(console);
var config;
var app;
var mopidy;
var online;

$.ajax('/static/config.json', {async: false}).done(function(data) {
  config = data;
});

function getUser(msg) {
  var user = prompt((typeof msg !== 'undefined' ? msg+"\n" : '')+'Enter your name');
  if ( user.match(/[^\w]/) ) {
    user = getUser('Invalid name! Only word chars');
  }
  return user;
}

var cookie = $.cookie('mobox');
if ( cookie !== null ) {
  cookie = JSON.parse(cookie);
  if ( !('user' in cookie) || !cookie.user.match(/^\w+$/) ) {
    cookie = null;
  }
}
if ( !cookie ) {
  cookie = {};
  cookie.user = getUser();
  $.cookie('mobox', JSON.stringify(cookie));
}

app = angular.module('mopidyWebClient', ['filters']);
app.config(['$routeProvider', '$locationProvider',  function ($routeProvider, $locationProvider) {
  $routeProvider
    .when('/app/', {templateUrl: '/static/partials/queue.html', controller: QueueController })
    .when('/app/queue', {templateUrl: '/static/partials/queue.html', controller: QueueController })
    .when('/app/playlists', {templateUrl: '/static/partials/playlists.html', controller: PlaylistsController})
    .when('/app/search', {templateUrl: '/static/partials/search.html', controller: SearchController})
    .otherwise({redirectTo: '/app/'});
  $locationProvider.html5Mode(true);
}]);

angular.module('filters', [])
  .filter('truncate', function () {
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
  }).filter('ms2time', function() {
    return function(ms) {
      if ( typeof ms === 'undefined' || ms === 0 ) return '0:00';
      var m = Math.floor((ms/1000) / 60);
      var s = Math.floor((ms/1000) % 60);
      if ( s < 10 ) {
        s = '0'+s;
      }
      return m+':'+s;
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
