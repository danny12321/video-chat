const express = require('express');
const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http);

http.listen(5500, function () {
  console.log('listening on *:' + 5500);
});

app.use(express.static('./public'));

let group = {name: 'test', users: []}

io.on('connection', socket => {
  console.log('connection')
  
  socket.on('getAllUsers', callback => {
    callback(group)
  })

  socket.on('addUser', (data, callback) => {
    group.users.push({socketId: socket.id});
    callback(group);
  })

  socket.on('updateUser', data => {
    console.log('updatepeer')

    let index = group.users.findIndex(a => {
      return a.socketId === socket.id
    })

    group.users[index].peer = data.peer;
    group.users[index].index = data.index;
  })

  socket.on('connectToPeer', data => {
    console.log('connectTopeer ja lets go')
    socket.to(data.socket).emit('connectToPeer', {peer: data.peer, socket: socket.id, index: data.index})
  })

  socket.on('finalHandshake', data => {
    socket.to(data.socket).emit('finalHandshake', {peer: data.peer, index: data.index})
  })

  socket.on('disconnect', () => {
    let index = group.users.findIndex(a => {
      return a.socketId === socket.id
    })

    if(index > -1)group.users.splice(index, 1)
  })
})