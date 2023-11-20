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
    socket.on('publish_socket_messages', (msg) => {
        io.emit(msg.channel, msg.msg);
    });

});


server.listen(8080, () => {
    console.log('listening on *:8080');
});