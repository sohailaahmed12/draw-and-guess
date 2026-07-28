import { useState, useEffect } from 'react';
import { socket } from './socket';
import ScoreBoard from './ScoreBoard';
import DrawingCanvas from './DrawingCanvas';
import GuessFeed from './GuessFeed';

const ROUND_SECONDS = 60;

function GameRoom({ roomCode, myName }) {
  const [players, setPlayers] = useState([]);
  const [phase, setPhase] = useState('waiting');
  const [currentDrawerId, setCurrentDrawerId] = useState(null);
  const [myWord, setMyWord] = useState(null);
  const [roundNumber, setRoundNumber] = useState(0);
  const [messages, setMessages] = useState([]);
  const [revealedWord, setRevealedWord] = useState(null);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [gameOverPlayers, setGameOverPlayers] = useState(null);
  const [showingResults, setShowingResults] = useState(false);

  const isDrawer = socket.id === currentDrawerId;
  const isHost = players[0]?.id === socket.id;

  useEffect(() => {
    socket.on('player-list-updated', (list) => setPlayers(list));

    socket.on('game-started', (data) => {
      setShowingResults(false);
      setPhase(data.gamePhase);
      setCurrentDrawerId(data.currentDrawerId);
      setRoundNumber(data.roundNumber);
      setPlayers(data.players);
      setMessages([]);
      setRevealedWord(null);
      setMyWord(null);
      setTimeLeft(ROUND_SECONDS);
    });

    socket.on('your-word', ({ word }) => setMyWord(word));

    socket.on('guess-wrong', ({ playerName, word }) => {
      setMessages((prev) => [...prev, { name: playerName, text: word, correct: false }]);
    });

    socket.on('guess-correct', ({ playerId, players }) => {
      setPlayers(players);
      const player = players.find((p) => p.id === playerId);
      setMessages((prev) => [...prev, { name: player?.name, correct: true }]);
    });

    socket.on('round-ended', ({ word, players }) => {
      setPlayers(players);
      setRevealedWord(word);
      setShowingResults(true);
    });

    socket.on('game-over', ({ players }) => {
      setGameOverPlayers(players);
    });

    return () => {
      socket.off('player-list-updated');
      socket.off('game-started');
      socket.off('your-word');
      socket.off('guess-wrong');
      socket.off('guess-correct');
      socket.off('round-ended');
      socket.off('game-over');
    };
  }, []);

  useEffect(() => {
    if (phase !== 'drawing' || showingResults) return;
    setTimeLeft(ROUND_SECONDS);
    const interval = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [roundNumber, phase]);

  function handleStart() {
    socket.emit('start-game', { roomCode });
  }

  if (gameOverPlayers) {
    const sorted = [...gameOverPlayers].sort((a, b) => b.score - a.score);
    return (
      <div className="lobby-page">
        <div className="paper-card lobby-card">
          <h1 className="squiggle-heading">Game over! 🎨</h1>
          <ul className="player-list">
            {sorted.map((p, i) => (
              <li key={p.id}>
                <span className="player-name">{i === 0 ? '🏆 ' : ''}{p.name}</span>
                <span className="player-score">{p.score}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (showingResults) {
    return (
      <div className="lobby-page">
        <div className="paper-card lobby-card">
          <h2 className="squiggle-heading">Round {roundNumber} results</h2>
          <p className="subtitle">The word was: <strong>{revealedWord}</strong></p>
          <ul className="player-list">
            {[...players].sort((a, b) => b.score - a.score).map((p) => (
              <li key={p.id}>
                <span className="player-name">{p.name}</span>
                <span className="player-score">{p.score}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (phase === 'waiting') {
    return (
      <div className="lobby-page">
        <div className="paper-card lobby-card">
          <h1 className="squiggle-heading">Room {roomCode}</h1>
          <p className="subtitle">Share this code with friends — waiting for everyone to join.</p>
          <ul className="player-list">
            {players.map((p) => (
              <li key={p.id}><span className="player-name">{p.name}</span></li>
            ))}
          </ul>
          {isHost ? (
            <button className="crayon-btn coral" onClick={handleStart}>Start game</button>
          ) : (
            <p className="subtitle">Waiting for the host to start...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="game-room">
      <div className="game-header">
        <h2 className="squiggle-heading small">Round {roundNumber}</h2>
        <div className="timer-badge">{timeLeft}s</div>
        {isDrawer ? (
          <p className="word-hint">Draw: <strong>{myWord}</strong></p>
        ) : (
          <p className="word-hint">Someone is drawing...</p>
        )}
      </div>

      <div className="game-body">
        <ScoreBoard players={players} currentDrawerId={currentDrawerId} mySocketId={socket.id} />
        <DrawingCanvas roomCode={roomCode} isDrawer={isDrawer} />
        <GuessFeed
          messages={messages}
          roomCode={roomCode}
          isDrawer={isDrawer}
          revealedWord={revealedWord}
        />
      </div>
    </div>
  );
}

export default GameRoom;