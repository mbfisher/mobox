var express = require('express');
var fs = require('fs');
var path = require('path');

var app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', function(req, res) {
  var html = fs.readFileSync('public/index.html', 'utf8');
  res.send(html);
});

app.listen(7000, '0.0.0.0');

var Tail = require('tail').Tail;
var WebSocket = require('faye-websocket');
var http = require('http');

var srv = http.createServer();

srv.on('upgrade', function(request, socket, body) {
  console.log('ws cn', socket.remoteAddress, socket.remotePort);
  if ( WebSocket.isWebSocket(request) ) {
    console.log('isWebSocket', socket.remoteAddress, socket.remotePort);

    var ws = new WebSocket(request, socket, body);

    tail = new Tail('/var/log/mopidy/debug.log');
    tail.on('line', function(data) {
      ws.send(data);
    });

    ws.on('close', function(event) {
      console.log('ws dn');
      tail.unwatch();
      tail = null;
      ws = null;
    });
  }
});

srv.listen(7070, '0.0.0.0');
