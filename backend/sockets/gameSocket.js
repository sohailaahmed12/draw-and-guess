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
const roundTimers = new Map();

function startRoundTimer(room, roomCode, io) {
  const timeoutId = setTimeout(() => {
    finishRound(room, roomCode, io);
  }, 60000);
  roundTimers.set(roomCode, timeoutId);
}

function finishRound(room, roomCode, io) {
  room.endRound();

  io.to(roomCode).emit('round-ended', {
    word: room.currentWord,
    players: room.players,
  });

  setTimeout(() => {
    if (room.isGameOver()) {
      io.to(roomCode).emit('game-over', { players: room.players });
      roundTimers.delete(roomCode);
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

      startRoundTimer(room, roomCode, io);
    }
  }, 4000); // 4-second pause showing round results before the next round
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
  if (room.gamePhase !== 'waiting') return;
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

startRoundTimer(room, roomCode, io);});

socket.on('submit-guess', ({ roomCode, word }) => {
  const room = rooms.get(roomCode);
  if (!room) return;

  if (room.correctGuessersThisRound.includes(socket.id)) {
    return; // already guessed correctly this round — ignore silently, no broadcast
  }

  const isCorrect = room.checkGuess(socket.id, word);

  if (isCorrect) {
    io.to(roomCode).emit('guess-correct', {
      playerId: socket.id,
      players: room.players,
    });

    const nonDrawerCount = room.players.length - 1;
    if (room.correctGuessersThisRound.length >= nonDrawerCount) {
      clearTimeout(roundTimers.get(roomCode));
      finishRound(room, roomCode, io);
    }
  } else {
    const player = room.players.find((p) => p.id === socket.id);
    io.to(roomCode).emit('guess-wrong', {
      playerName: player.name,
      word: word,
    });
  }
});

socket.on('draw-stroke', ({ roomCode, stroke }) => {
  socket.to(roomCode).emit('draw-stroke', stroke);
});

socket.on('clear-canvas', ({ roomCode }) => {
  socket.to(roomCode).emit('clear-canvas');
});
socket.on('disconnect', () => {
  for (const [roomCode, room] of rooms.entries()) {
    const playerIndex = room.players.findIndex((p) => p.id === socket.id);
    if (playerIndex !== -1) {
      const wasDrawer = room.currentDrawerId === socket.id;

      room.players.splice(playerIndex, 1);

      io.to(roomCode).emit('player-list-updated', room.players);

      if (wasDrawer) {
        room.gamePhase = 'game-over';
        io.to(roomCode).emit('game-stopped', {
          message: 'The drawer disconnected — game ended.',
        });
      }

      break;
    }
  }
});
  });
};