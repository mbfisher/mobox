var express = require('express');
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;

var app = express();

app.use('/static', express.static(__dirname+'/public'));
app.use(express.bodyParser());

app.get('/db/plays', function(req, res) {
  MongoClient.connect('mongodb://127.0.0.1:27017', function(err, db) {
    if ( err ) throw err;

    var collection = db.collection('plays');
    collection.find().toArray(function(err, docs) {
      if ( err ) throw err;
      console.log(docs);
      res.send(docs);
    });
  });
});

app.post('/db/plays', function(req, res) {
  console.log(req.body);
  MongoClient.connect('mongodb://127.0.0.1:27017', function(err, db) {
    if ( err ) throw err;

    var collection = db.collection('plays');
    collection.insert([req.body], function(err, docs) {
      if ( err ) throw err;
      res.send('{"success": true}');
    });
  });
});

app.get('/app/*', function(req, res) {
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

//srv.listen(7070, '0.0.0.0');
