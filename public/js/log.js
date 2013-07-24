var socket = io.connect('http://10.192.115.42:7000');
socket.on('entry', function(event) {
  $('#log').append('<span>'+event+"\n</span>");
  if ( $('#log span').size() > 10 ) $('#log span:first').remove();
});
