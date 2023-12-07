const listeners = require('../bin/event-listeners')
const db = require('./db.js');

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
      case 'TYPING':
        userTyping(reqData, client);
        break;
      case 'SEND_MESSAGE':
        sendMessage(reqData, client);
        break;
    }
  });

  // Client disconnected
  client.on('disconnect', () => {
    if (users[connectedUserId]) {
      const userSockets = users[connectedUserId];
      listeners.onDebug("Disconnected User ID >> " + connectedUserId + " << Disconnected socket >>" + userSockets);
      userSockets.splice(userSockets.indexOf(client.id), 1);
      console.log("After disconnect users >> ", users);
      if (userSockets.length === 0) {
        sendOnlineOffline(connectedUserId, "USER_OFFLINE");
        delete users[connectedUserId];
      }
    }
  });
}

let userJoin = async (data, client) => {
  const userId = data.userId;
  client.join(userId);
  if (users[userId]) {
    users[userId].push(client.id);
  } else {
    sendOnlineOffline(userId, "USER_ONLINE")
    users[userId] = [client.id];
  }
  console.log("After connect users >> ", users);
  
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

let userTyping = (data, client) => {
  io.in(data.to_user._id).emit("TYPING", {
    "message": data.from_user + " is Typing..."
  });
}

let sendMessage = async (data, client) => {
  // store in DB
  const sendMessage = db.Chat({
    "from_id": data.from_id.id,
    "to_id": data.to_id.id,
    "message": data.message
  })
  await sendMessage.save()
    .then((result) => {
      io.in(data.to_id.id).emit("RECEIVE_MESSAGE", {
        "data": data
      });
    })
    .catch((err) => {
      listeners.onError("Send Message >> SEND_MESSAGE Socket call")
      listeners.onError(err)
      listeners.onError("<<< >>>")
      res.status(500).json({
        error: err
      })
    });
}

let sendOnlineOffline = async (userId, emitName) => {
  console.log("Here send request >> ");
  // get user friends
  await db.UserFollowRequest
    .find({ "to_id": new db.ObjectId(userId), "acceptStatus": true })
    .select('-_id from_id')
    .exec()
    .then((result) => {
      let sendUser = [...result.map(item => item.from_id.toString())]
      io.in(sendUser).emit(emitName, {
        "userId": userId
      });
    })
    .catch((err) => {
      listeners.onError("Get friend list in chat")
      listeners.onError(err)
      listeners.onError("<<< >>>")
      res.status(500).json({
        error: err
      })
    });
}

module.exports = {
  socketConnection
};