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
    // socket.on('chat message', (msg) => {
    //     console.log('message: ' + msg);
    // });

});

setInterval(() => {
    const randomNumber = Math.floor(Math.random() * 100000); // Generate a random number between 0 and 99
    io.emit('randomNumber', randomNumber);
}, 1000);


setInterval(() => {
    const randTwo = Math.floor(Math.random() * 100000); // Generate a random number between 0 and 99
    io.emit('eventTwo', randTwo);
}, 500);

setInterval(() => {
    axios.get('https://jsonplaceholder.typicode.com/posts')
        .then((response) => {
            const posts = response.data;
            const sdfd = Math.floor(Math.random() * 100000);
            io.emit('postsData', { 'data': posts, 'random': sdfd });
        })
        .catch((error) => {
            console.error('Error fetching posts:', error);
        });
}, 2000);


setInterval(() => {
    const rts = Math.floor(Math.random() * 100000); // Generate a random number between 0 and 99
    io.emit('eventTo', rts + `By passing the cors option with origin: '*' when creating the Server instance, Socket.IO will also include the necessary CORS headers in its responses.

    Make sure to restart your backend server after making these changes. This should address the CORS error and allow your front-end application to connect to the backend socket without any issues.
    
    If the issue persists, ensure that there are no other conflicting CORS configurations in your server setup, such as additional middleware or server settings that override the Socket.IO CORS configuration.`);
}, 1000);







server.listen(8080, () => {
    console.log('listening on *:8080');
});