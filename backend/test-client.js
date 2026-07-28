const { io } = require('socket.io-client');

const player1 = io('http://localhost:3000');
const player2 = io('http://localhost:3000');

let sharedRoomCode;

player1.on('connect', () => {
  console.log('Player 1 connected:', player1.id);
  player1.emit('create-room', 'Sohaila');
});

player1.on('room-created', ({ roomCode }) => {
  console.log('Room created:', roomCode);
  sharedRoomCode = roomCode;
  player2.emit('join-room', { roomCode, playerName: 'Ahmed' });
});

player2.on('room-joined', ({ roomCode }) => {
  console.log('Player 2 joined room:', roomCode);
  setTimeout(() => {
    player1.emit('start-game', { roomCode });
  }, 1000);
});

player1.on('your-word', ({ word }) => {
  console.log('Player 1 (drawer) got the word:', word);
});

player1.on('game-started', (data) => {
  console.log('game-started (round', data.roundNumber, ') drawer:', data.currentDrawerId);
});

player1.on('round-ended', (data) => {
  console.log('--- ROUND ENDED --- word was:', data.word, '| scores:', data.players);
});

player1.on('game-over', (data) => {
  console.log('=== GAME OVER === final scores:', data.players);
  process.exit();
});