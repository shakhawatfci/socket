const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: '*',
    },
});

const cors = require('cors');
app.use(cors({
    origin: '*',
}));
const axios = require('axios');
io.on('connection', (socket) => {
    socket.on('new_user_created_backend', (msg) => {
        io.emit('new_user_created', msg);
    });

    socket.on('user_updated_backend', (msg) => {
        io.emit('user_updated', msg);
    });

});


server.listen(8080, () => {
    console.log('listening on *:8080');
});