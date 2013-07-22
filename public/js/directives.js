app.directive('moboxTracklist', function($compile) {
    return function(scope, element, attrs) {
      function drawTracklist(tracklist) {
        var html = '<tbody>';
        var track;
        for ( var i in tracklist.slice(0, 20) ) {
          track = tracklist[i];
          var row = '<tr>'+[
            '<td>{{ track.name }}</td>',
            '<td>{{ track.artists[0].name }}</td>',
            '<td>{{ track.album.name }}</td>',
            '<td><a ng-click="addToQueue(track)">Add</a></td>'
          ].join('')+'</tr>';
        
          $compile(row)({track: track});
          html += row;
        }
        element.html(html);
      }

      scope.$watch(attrs.moboxTracklist, function(value) {
        drawTracklist(typeof(value) !== 'undefined' ? value : []);
      });
    };
  });
