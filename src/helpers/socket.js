const listeners = require('../bin/event-listeners')
let io
let rooms = [];

let socketConnection = (server) => {
  io = require('socket.io')(server)
  io.on("connection", connectedClient);
};

let connectedClient = (client) => {
  listeners.onDebug("a user connected");
  listeners.onDebug("Client ID >> " + client.id);

  // Get requested from client
  client.on('req', async function (data) {
    if (typeof data.en == 'undefined' && typeof data.data == 'undefined') {
      sendData('ERROR', {
        msg: "Something went wrong, please try again.",
        code: 0
      }, client);
      return false;
    }
    let en = data.en;
    let reqData = data.data;
    switch (en) {
      case 'USER_JOIN':
        userJoin(reqData, client);
        break;
    }
  });

  // Client disconnected
  client.on('disconnect', () => {
    console.log('user disconnected >> ', client.id);
  });
}

let userJoin = (data, client) => {
  if (rooms.length > 0) {
    rooms.forEach(function(val) {
      if (val !== data.uid) {
        rooms.push(data.uid);
      }
    });
  } else {
    rooms.push(data.uid);
  }
  client.room = data.uid;
  client.join(data.uid);
  console.log("client.room >>", client.room);
}
module.exports = {
  socketConnection
};