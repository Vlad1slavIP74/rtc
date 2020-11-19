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
    guests: []
  };
};

exports.getRoomById = (roomID) => rooms[roomID];
exports.removeRoom = (roomID) => delete rooms[roomID];

exports.joinRoom = (roomID, socket) => {
  const obj = {
    id: socket.id,
    socket
  };

  rooms[roomID].guests.push(obj);
};
