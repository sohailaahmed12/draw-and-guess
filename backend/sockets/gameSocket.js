const Room = require('../game/Room');
const rooms = new Map();
const letters=['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];

function generateRoomCode(){
    let roomCode='';
    for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * letters.length);
        roomCode=letters[randomIndex]+roomCode
    }
    return roomCode;
}        
module.exports = function setupGameSocket(io) {
  io.on('connection', (socket) => {
    console.log('A client connected:', socket.id);
    socket.on('create-room', (playerName) => {
        const roomCode=generateRoomCode();
        const theNewRoom=new Room(roomCode);
        rooms.set(roomCode, theNewRoom);
        theNewRoom.addPlayer(socket.id, playerName);
        socket.join(roomCode);
        socket.emit('room-created', { roomCode });
    });

socket.on('join-room', ({ roomCode, playerName }) => {
  const room = rooms.get(roomCode);

  if (!room) {
    socket.emit('join-error', { message: 'Room not found' });
    return;
  }

  room.addPlayer(socket.id, playerName);
  socket.join(roomCode);
  socket.emit('room-joined', { roomCode });

  io.to(roomCode).emit('player-list-updated', room.players);
});

    // event handlers will go here

  });
};