import { useState } from 'react';
import { socket } from './socket';

function GuessFeed({ messages, roomCode, isDrawer, revealedWord }) {
  const [guess, setGuess] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!guess.trim()) return;
    socket.emit('submit-guess', { roomCode, word: guess.trim() });
    setGuess('');
  }

  return (
    <div className="paper-card guess-feed">
      <div className="guess-messages">
        {revealedWord && (
          <p className="guess-bubble reveal">The word was: <strong>{revealedWord}</strong></p>
        )}
        {messages.map((m, i) => (
          <p key={i} className={`guess-bubble ${m.correct ? 'correct' : ''}`}>
            {m.correct ? `🎉 ${m.name} guessed it!` : <><strong>{m.name}:</strong> {m.text}</>}
          </p>
        ))}
      </div>

      {!isDrawer && (
        <form onSubmit={handleSubmit} className="guess-input-row">
          <input
            type="text"
            placeholder="Type your guess..."
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
          />
          <button type="submit" className="crayon-btn sky">Guess</button>
        </form>
      )}
    </div>
  );
}

export default GuessFeed;