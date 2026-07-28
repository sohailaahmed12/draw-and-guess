# Draw and Guess

A real-time drawing and guessing game built with React, Vite, Express, and Socket.IO.

Players can create or join rooms, take turns drawing a secret word, and guess what others are drawing before time runs out.

## Features

- Create or join a game room with a 4-letter room code
- Real-time drawing sync across players
- Turn-based rounds with a drawer and guessers
- Score tracking for correct guesses
- Game ends after one round per player

## Tech Stack

- Frontend: React + Vite
- Backend: Express + Socket.IO
- Realtime communication: Socket.IO
- Styling: CSS modules and custom component styles

## Project Structure

- `backend/` - Express server and Socket.IO game logic
  - `index.js` - server entry point
  - `sockets/gameSocket.js` - socket event handlers and game flow
  - `game/Room.js` - room state, player rotation, word checking, scoring
  - `game/words.js` - word list for rounds
- `frontend/` - React app
  - `src/App.jsx` - top-level app routing between lobby and game room
  - `src/Lobby.jsx` - room creation and joining UI
  - `src/GameRoom.jsx` - game state, events, and UI flow
  - `src/DrawingCanvas.jsx` - canvas drawing and stroke broadcasting
  - `src/GuessFeed.jsx` - guess input and messages
  - `src/ScoreBoard.jsx` - score display and current drawer indicator
  - `src/socket.js` - client-side socket connection

## Getting Started

### Prerequisites

- Node.js 18+ recommended
- npm or yarn

### Install dependencies

Open two terminal windows.

1. Install backend dependencies:

```bash
cd backend
npm install
```

2. Install frontend dependencies:

```bash
cd frontend
npm install
```

### Run the app locally

1. Start the backend server:

```bash
cd backend
node index.js
```

The backend listens on `http://localhost:3000`.

2. Start the frontend dev server:

```bash
cd frontend
npm run dev
```

3. Open the local Vite URL shown in your terminal (usually `http://localhost:5173`).

## How to Play

1. Open the app in your browser.
2. Enter your name and create a room, or join with a 4-letter code.
3. The first player to create the room becomes host.
4. When enough players have joined, the host starts the game.
5. Each round one player draws while the others guess.
6. Correct guesses earn points; the game ends after every player has drawn once.

## Notes

- Only the drawer can draw on the canvas.
- Guessers can submit text guesses in real time.
- The drawer's word is shown only to the current drawer.
- When everyone guesses correctly or the round timer ends, the round finishes and the next player draws.

## Troubleshooting

- If rooms fail to connect, ensure the backend is running on `http://localhost:3000`.
- Make sure the frontend and backend are started in separate terminals.
- If the room code is invalid, double-check the 4-letter code and refresh the page if needed.

## License

This project is currently unlicensed.
