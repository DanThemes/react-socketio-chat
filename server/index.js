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
        methods: ['GET', 'POST'],
        credentials: true
    }
});

io.engine.on("connection_error", (err) => {
    console.log(err);
  });

// middleware
io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    if (!username) {
        // socket.username = '1';
        // console.log(socket.handshake.auth)
        return next(new Error('Invalid username'));
    }
    socket.username = username;
    next();
})


io.on('connection', socket => {

    const users = [];
    for (let [id, socket] of io.of('/').sockets) {
        users.push({
            userId: id,
            username: socket.username,
            messages: []
        })
    }
    socket.emit('users', users);

    socket.broadcast.emit('user connected', {
        userId: socket.id,
        username: socket.username,
        messages: []
    })

    console.log(`user connected ${socket.id}`)

    socket.on('join_room', data => {
        socket.join(data);
    })

    socket.on('send_message', data => {
        socket.to(data.room).emit('receive_message', data);
    })

    socket.on('private_message', ({message, to}) => {
        socket.to(to).emit('private_message', {
            message,
            from: socket.id
        })
        socket.emit('users', users);
    })
})

app.get('/', (req, res) => {
    res.send('Hi')
})

server.listen(3001, () => {
    console.log('Server is running.')
})