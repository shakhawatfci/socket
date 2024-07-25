const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const crypto = require('crypto');
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

// Function to generate token based on current date
// const generateToken = () => {
//     const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
//     return crypto.createHash('md5').update(currentDate).digest('hex');
// };

const generateToken = () => {
    const offset = 6; // UTC+6
    const date = new Date();
    const utcDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
    const localDate = new Date(utcDate.getTime() + (offset * 3600000));
    const formattedDate = localDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    const tokenString = 'QNT+' + formattedDate;
    return crypto.createHash('md5').update(tokenString).digest('hex');
};




// Middleware to authenticate the token
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (token === generateToken()) {
        return next();
    }
    console.log('auth error');
    return next(new Error('Authentication error'));
});

io.on('connection', (socket) => {
    console.log('user connected');
    socket.on('publish_socket_messages', (msg) => {
        io.emit(msg.channel, msg.msg);
    });

});


server.listen(8080, () => {
    console.log('listening on *:8080');
});