const io = require('socket.io');
const { compact } = require('lodash');
const users = require('./users');
const rooms = require('./rooms');
/**
 * Initialize when a connection is made
 * @param {SocketIO.Socket} socket
 */
function initSocket(socket) {
  let id;
  socket
    .on('init', async () => {
      console.log('from server', users.getAll());
      id = await users.create(socket);
      socket.emit('init', { id });
      console.log('init', id);
    })
    .on('request', (data) => {
      console.log('request', id);
      console.log('request', { data });

      const receiver = users.get(data.to);
      if (receiver) {
        receiver.emit('request', { from: id });
      }
    })
    .on('call', (data) => {
      const receiver = users.get(data.to);
      if (receiver) {
        if (data.candidate) {
          console.log(444);
        }
        console.log('call', { ...data, from: id });
        receiver.emit('call', { ...data, from: id });
      } else {
        socket.emit('failed');
      }
    })
    .on('end', (data) => {
      // add logic work with room
      const receiver = users.get(data.to);
      if (receiver) {
        receiver.emit('end');
      }
    })
    .on('disconnect', () => {
      users.remove(id);
      console.log(id, 'disconnected');
    })

    .on('createRoom', (data) => {
      const result = rooms.createRoom(data.roomID, socket, data.clientId);

      if (result) {
        socket.emit('failed');
      }
      console.log(rooms.getRoomById(data.roomID));
    })

    .on('joinRoom', (data) => {
      const room = rooms.getRoomById(data.to);

      console.log(2);
      if (data.candidate) {
        console.log('\ncandidate\n', data);
      }

      if (room) {
        rooms.joinRoom(data.to, socket, data.guestId);

        // eslint-disable-next-line no-restricted-syntax
        for (const guest of room.guests) {
          if (guest.guestId === id) continue;
          const { socket: guestSocket } = guest;
          guestSocket.emit('joinRoom', {
            ...data,
            from: id,
            roomRequest: true,
            to: guest.guestId
            // to:
          });
        }
      }
    });
}

module.exports = (server) => {
  io({ path: '/bridge', serveClient: false })
    .listen(server, { log: true })
    .on('connection', initSocket);
};
