const Room = require('../game/Room');
const rooms = new Map();
const letters=['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
const words = require('../game/words');

function generateRoomCode(){
    let roomCode='';
    for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * letters.length);
        roomCode=letters[randomIndex]+roomCode
    }
    return roomCode;
}  
function runRoundTimer(room, roomCode, io) {
  setTimeout(() => {
    room.endRound();

    io.to(roomCode).emit('round-ended', {
      word: room.currentWord,
      players: room.players,
    });

    if (room.isGameOver()) {
      io.to(roomCode).emit('game-over', {
        players: room.players,
      });
    } else {
      room.startNewRound(words);

      io.to(roomCode).emit('game-started', {
        gamePhase: room.gamePhase,
        currentDrawerId: room.currentDrawerId,
        roundNumber: room.roundNumber,
        players: room.players,
      });

      io.to(room.currentDrawerId).emit('your-word', {
        word: room.currentWord,
      });

      runRoundTimer(room, roomCode, io);
    }
  }, 60000);
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
        io.to(roomCode).emit('player-list-updated', theNewRoom.players);
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

socket.on('start-game', ({ roomCode }) => {
  const room = rooms.get(roomCode);
  if (!room) {
    return;
  }
  room.startGame(words);
  io.to(roomCode).emit('game-started', {
    gamePhase: room.gamePhase,
    currentDrawerId: room.currentDrawerId,
    roundNumber: room.roundNumber,
    players: room.players,
});
io.to(room.currentDrawerId).emit('your-word', {
  word: room.currentWord,
});

runRoundTimer(room, roomCode, io);
});

socket.on('submit-guess', ({ roomCode, word }) => {
  const room = rooms.get(roomCode);
  if (!room) {
    return;
  }

  const isCorrect = room.checkGuess(socket.id, word);

  if (isCorrect) {
    io.to(roomCode).emit('guess-correct', {
      playerId: socket.id,
      players: room.players,
    });
  } else {
    const player = room.players.find((p) => p.id === socket.id);
    io.to(roomCode).emit('guess-wrong', {
      playerName: player.name,
      word: word,
    });
  }
});


  });
};