const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const setupGameSocket = require('./sockets/gameSocket');

const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*' },
});

setupGameSocket(io);

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});