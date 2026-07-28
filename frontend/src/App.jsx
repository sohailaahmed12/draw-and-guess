import { useState } from 'react';
import Lobby from './Lobby';
import GameRoom from './GameRoom';
import './App.css';

function App() {
  const [room, setRoom] = useState(null);

  if (!room) {
    return <Lobby onJoined={(roomCode, name) => setRoom({ roomCode, name })} />;
  }

  return <GameRoom roomCode={room.roomCode} myName={room.name} />;
}

export default App;