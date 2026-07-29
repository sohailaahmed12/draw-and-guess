# Doodle and Guess

A real-time multiplayer drawing-and-guessing game (Pictionary-style), built with React, Vite, Express, and Socket.IO. Players create or join rooms, take turns drawing a secret word live on a shared canvas, and race to guess it first.


## Features

- **Real-time canvas sync** — every stroke the drawer makes streams live to all other players over WebSockets, with adjustable colors
- **Rank-based scoring** — guessing faster earns more points; the first correct guess scores highest, decreasing for each guesser after, down to a floor value
- **Word privacy** — the secret word is sent only to the current drawer; everyone else sees guesses (right or wrong) without the answer ever leaking early
- **Automatic round flow** — a round timer runs down, but ends early once every guesser has answered correctly; results are shown for a few seconds before the next round begins automatically
- **Turn rotation** — every player gets exactly one turn as drawer per game, in join order
- **Host-controlled start** — only the room creator can start the game once everyone's joined
- **Disconnect handling** — if a player leaves mid-game, the room updates for everyone; if the current drawer disconnects, the game ends gracefully instead of breaking

## Tech stack

**Frontend:** React (Vite), Socket.IO client, HTML canvas
**Backend:** Node.js, Express, Socket.IO
**Realtime communication:** Socket.IO (WebSockets), including room-scoped broadcasts and private per-socket messages

## Project structure

```
backend/
├── index.js                Server entry point
├── sockets/
│   └── gameSocket.js         Socket.IO event handlers — rooms, rounds, guessing, drawing relay
├── game/
│   ├── Room.js                 Core game state — players, turn rotation, scoring, round lifecycle
│   └── words.js                   Word list for rounds

frontend/
└── src/
    ├── App.jsx                Top-level routing — lobby vs. game room
    ├── Lobby.jsx                Room creation / joining UI
    ├── GameRoom.jsx               Game state, socket events, phase-based UI
    ├── DrawingCanvas.jsx            Canvas drawing, stroke broadcasting, color/eraser tools
    ├── GuessFeed.jsx                  Guess input and live guess feed
    ├── ScoreBoard.jsx                   Live scores and current-drawer indicator
    └── socket.js                          Client-side socket connection
```

## Architecture notes

The `Room` class is a pure, self-contained game-state model — it holds no knowledge of Socket.IO, timers, or networking, only the data and logic of one game (players, whose turn it is, the current word, scores). All real-time orchestration — broadcasting, timers, and per-socket privacy — lives in `gameSocket.js`, which calls into `Room`'s methods and decides what to send to whom. This separation kept the game logic easy to test and reason about independently of the transport layer.

## Running it locally

**Backend**
```bash
cd backend
npm install
node index.js
```
Runs on `http://localhost:3000`.

**Frontend**
```bash
cd frontend
npm install
npm run dev
```
Open the printed local URL (usually `http://localhost:5173`).

Open the frontend in two separate browser tabs/windows to simulate two players.

## How to play

1. Enter your name and create a room, or join with a 4-letter code.
2. The room creator starts the game once everyone's in.
3. Each round, one player draws the assigned word while everyone else guesses live.
4. Correct guesses earn points based on how quickly they're submitted.
5. After every player has had one turn drawing, final scores are shown.

## What I'd add next

- Persisting past games / a leaderboard across sessions
- Word-choice options for the drawer instead of auto-assignment
- Deployment (backend needs a host that supports persistent WebSocket connections — not a serverless platform like Vercel)

## Author

**Sohaila Ahmed** — Biomedical & Healthcare Data Engineering student, Cairo University
[GitHub](https://github.com/sohailaahmed12)
