
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);

const io = new Server(server, { //wraps server in a socket object 
  cors: { origin: '*' },
});

io.on('connection',(socket)=>{
    console.log('A client connected:', socket.id);
})



server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});