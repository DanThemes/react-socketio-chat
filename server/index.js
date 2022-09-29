const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');

const cors = require('cors');

app.use(cors());

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ['GET', 'POST']
    }
});

io.on('connection', socket => {
    console.log(`user connected ${socket.id}`)

    socket.on('send_message', data => {
        socket.broadcast.emit('receive_message', data);
    })
})

app.get('/', (req, res) => {
    res.send('Hi')
})

server.listen(3001, () => {
    console.log('Server is running.')
})