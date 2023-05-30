const socket = io("http://localhost:8080");

socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('randomNumber', (msg) => {
    console.log('Received message:', msg);
});

socket.on('eventTwo', (msg) => {
    console.log('Event  message:', msg);
});
socket.on('eventTo', (msg) => {
    console.log('Evenrt  message:', msg);
});

socket.on('postsData', (msg) => {
    console.log(msg);

    msg.data.forEach((item) => {
        console.log(item.title);
    })
    msg.data.forEach((item) => {
        console.log(item.title);
    })
    msg.data.forEach((item) => {
        console.log(item.title);
    })
    msg.data.forEach((item) => {
        console.log(item.title);
    })
    msg.data.forEach((item) => {
        console.log(item.title);
    })
    msg.data.forEach((item) => {
        console.log(item.title);
    })
    msg.data.forEach((item) => {
        console.log(item.title);
    })
    msg.data.forEach((item) => {
        console.log(item.title);
    })
});

socket.on('posy', (msg) => {
    console.log(msg);

    msg.data.forEach((item) => {
        console.log(item.title);
    })
    msg.data.forEach((item) => {
        console.log(item.title);
    })
    msg.data.forEach((item) => {
        console.log(item.title);
    })
    msg.data.forEach((item) => {
        console.log(item.title);
    })
    msg.data.forEach((item) => {
        console.log(item.title);
    })
    msg.data.forEach((item) => {
        console.log(item.title);
    })
    msg.data.forEach((item) => {
        console.log(item.title);
    })
    msg.data.forEach((item) => {
        console.log(item.title);
    })
});

window.addEventListener('beforeunload', () => {
    socket.disconnect();
    console.log('Socket connection closed.');
});