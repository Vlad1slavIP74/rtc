const io = require('socket.io');
const users = require('./users');

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
        console.log('call', { ...data, from: id });
        receiver.emit('call', { ...data, from: id });
      } else {
        socket.emit('failed');
      }
    })
    .on('end', (data) => {
      const receiver = users.get(data.to);
      if (receiver) {
        receiver.emit('end');
      }
    })
    .on('disconnect', () => {
      users.remove(id);
      console.log(id, 'disconnected');
    })
    .on('sendMessage', (data) => {
      const receiver = users.get(data.to);
      console.log(data);
      if (receiver) {
        console.log('MESSAGE', data);
        receiver.emit('sendMessage', { ...data, from: id });
      }
    });
}

module.exports = (server) => {
  io({ path: '/bridge', serveClient: false })
    .listen(server, { log: true })
    .on('connection', initSocket);
};
