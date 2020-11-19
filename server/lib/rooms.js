const rooms = {};


exports.createRoom = (roomID, socket, creatorId) => {
  if (rooms[roomID]) {
    return 1;
  }
  rooms[roomID] = {
    creatorInfo: {
      creatorId,
      socket
    },
    guests: [{
      id: socket.id,
      socket,
      guestId: creatorId
    }]
  };
};

exports.getRoomById = (roomID) => rooms[roomID];
exports.removeRoom = (roomID) => delete rooms[roomID];

exports.joinRoom = (roomID, socket, guestId) => {
  const obj = {
    id: socket.id,
    socket,
    guestId
  };
  if (rooms[roomID].guests.find((objGuest) => objGuest.id === socket.id)) {
    console.log('exist', guestId);
    return;
  }
  rooms[roomID].guests.push(obj);
};
