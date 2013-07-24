var ws = new WebSocket('ws://10.192.115.42:7070');
ws.onmessage = function(event) {
  //if ( event.data.length < 100 ) {
    $('#log').append('<span>'+event.data+"\n</span>");
    if ( $('#log span').size() > 10 ) $('#log span:first').remove();
  //}
};
