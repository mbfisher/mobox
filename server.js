var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
var Tail = require('tail').Tail;
var WebSocket = require('faye-websocket');
var express = require('express');

var app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

var config = require(__dirname+'/public/config.json');
io.set('log level', config.mobox.loggers['socket.io']);

server.listen(config.mobox.port, config.mobox.host);

app.use('/static', express.static(__dirname+'/public'));
app.use(express.bodyParser());

function mongo(collection, callbacks) {
  MongoClient.connect(config.mongo.uri, function(err, db) {
    if ( err ) {
      console.log(JSON.stringify(err));
      console.error('Mongo Error', err[0]);
      return callbacks.error(err[0]);
    }
    var _collection = db.collection(collection);
    return callbacks.success(_collection);
  });
}


app.get('/db/plays', function(req, res) {
  mongo('plays', {
    error: function(err) {
      res.writeHead(500);
      res.end(JSON.stringify({error: err}))
    },
    success: function(collection) {
      collection.find().toArray(function(err, docs) {
        if ( err ) res.send(JSON.stringify({success: false, error: err}));
        res.send(docs);
      });
    }
  });
});

app.post('/db/plays', function(req, res) {
  console.log('POST /db/plays', req.body);
  var play = req.body
  play.client = req.connection.remoteAddress;
  mongo('plays', {
    error: function(err) {
      res.writeHead(500);
      res.end(JSON.stringify({error: err}))
    },
    success: function(collection) {
      collection.insert(play, function(err, docs) {
        if ( err ) {
          res.writeHead(500);
          res.end(JSON.stringify({error: err}));
        }
        res.send({success: true});
      });
    }
  });
});

app.post('/db/plays/reset', function(req, res) {
  mongo('plays', {
    error: function(err) {
      res.writeHead(500);
      res.send(JSON.stringify({error: err}))
    },
    success: function(collection) {
      collection.remove(function(err, docs) {
        res.end();
      });
    }
  });
});

app.get('/app*', function(req, res) {
  var html = fs.readFileSync(__dirname+'/public/index.html', 'utf8');
  res.send(html);
});

io.sockets.on('connection', function(socket) {
  tail = new Tail('/var/log/mopidy/debug.log');
  tail.on('line', function(data) {
    socket.emit('entry', data);
  });
});
