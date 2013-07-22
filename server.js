var express = require('express');
var fs = require('fs');
var path = require('path');

var app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', function(req, res) {
  var html = fs.readFileSync('public/index.html', 'utf8');
  res.send(html);
});

app.listen(7000, '127.0.0.1');
