const listeners = require('../bin/event-listeners')
let io
// let rooms = [];
const users = {};

let socketConnection = (server) => {
  io = require('socket.io')(server)
  io.on("connection", connectedClient);
};

// Connect new user
let connectedClient = (client) => {
  listeners.onDebug("Connected User ID >> " + client.handshake.query.userId + " << Connected Socket ID >>" + client.id);
  let connectedUserId = client.handshake.query.userId;

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
      case 'FOLLOW_REQUEST':
        followRequest(reqData, client);
        break;
    }
  });

  // Client disconnected
  client.on('disconnect', () => {
    if (users[connectedUserId]) {
      const userSockets = users[connectedUserId];
      listeners.onDebug("Disconnected User ID >> " + connectedUserId + " << Disconnected socket >>" + userSockets);
      userSockets.splice(userSockets.indexOf(client.id), 1);
      if (userSockets.length === 0) {
        delete users[connectedUserId];
      }
    }
  });
}

let userJoin = (data, client) => {
  const userId = data.userId;
  client.join(userId);
  if (users[userId]) {
    users[userId].push(client.id);
  } else {
    users[userId] = [client.id];
  }
  console.log("users >> ", users);
  // io.in('65068f808cb9d33b5c1d2eb0').emit("hello", {
  //   'data': "Hii 1111"
  // });
  // if (rooms.length > 0) {
  //   rooms.forEach(function(val) {
  //     if (val !== data.uid) {
  //       rooms.push(data.uid);
  //     }
  //   });
  // } else {
  //   rooms.push(data.uid);
  // }
  // client.room = data.uid;
  // client.join(data.uid);
  // console.log("client.room >>", client.room);
}

let followRequest = (data, client) => {
  io.in(data.to_user_id).emit("FOLLOW_REQUEST", {
    "message": "You have new follow request from " + data.from_user_id
  });
}

module.exports = {
  socketConnection
};