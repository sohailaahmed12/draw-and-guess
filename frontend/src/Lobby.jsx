import { useState } from 'react';
import { socket } from './socket';

function Lobby({ onJoined }) {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState('create');
  const [error, setError] = useState('');

  function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    socket.emit('create-room', name.trim());
  }

  function handleJoin(e) {
    e.preventDefault();
    if (!name.trim() || !roomCode.trim()) return;
    socket.emit('join-room', { roomCode: roomCode.trim().toUpperCase(), playerName: name.trim() });
  }

  useState(() => {
    socket.on('room-created', ({ roomCode }) => onJoined(roomCode, name.trim()));
    socket.on('room-joined', ({ roomCode }) => onJoined(roomCode, name.trim()));
    socket.on('join-error', ({ message }) => setError(message));
    return () => {
      socket.off('room-created');
      socket.off('room-joined');
      socket.off('join-error');
    };
  }, []);

  return (
    <div className="lobby-page">
      <div className="paper-card lobby-card">
        <h1 className="squiggle-heading">Doodle &amp; Guess</h1>
        <p className="subtitle">Grab your crayons — someone's about to draw something silly.</p>

        <div className="mode-toggle">
          <button className={mode === 'create' ? 'active' : ''} onClick={() => setMode('create')}>Create room</button>
          <button className={mode === 'join' ? 'active' : ''} onClick={() => setMode('join')}>Join room</button>
        </div>

        <form onSubmit={mode === 'create' ? handleCreate : handleJoin}>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {mode === 'join' && (
            <input
              type="text"
              placeholder="Room code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              maxLength={4}
            />
          )}
          <button type="submit" className="crayon-btn coral">
            {mode === 'create' ? 'Create room' : 'Join room'}
          </button>
        </form>

        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  );
}

export default Lobby;