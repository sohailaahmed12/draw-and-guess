const AVATAR_COLORS = ['#FF6F91', '#5FC9D8', '#FFC857', '#8FD6A6', '#B695E0', '#F4978E'];

function colorForPlayer(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash += id.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function ScoreBoard({ players, currentDrawerId, mySocketId }) {
  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="paper-card scoreboard">
      <h3 className="squiggle-heading small">Players</h3>
      <ul className="player-list">
        {sorted.map((p) => (
          <li key={p.id} className={p.id === currentDrawerId ? 'drawing' : ''}>
            <span className="avatar" style={{ background: colorForPlayer(p.id) }}>
              {p.name.charAt(0).toUpperCase()}
            </span>
            <span className="player-name">
              {p.name} {p.id === mySocketId && '(you)'}
            </span>
            {p.id === currentDrawerId && <span className="pencil">✏️</span>}
            <span className="player-score">{p.score}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ScoreBoard;