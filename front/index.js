

const generateToken = () => {
    const offset = 6; // UTC+6
    const date = new Date();
    const utcDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
    const localDate = new Date(utcDate.getTime() + (offset * 3600000));
    const formattedDate = localDate.toISOString().split('T')[0]; // YYYY-MM-DD 
    const tokenString = 'QNT+' + formattedDate;
    return CryptoJS.MD5(tokenString).toString();
};


const token = generateToken();

const socket = io("http://localhost:8080", { // Specify your server URL here
    auth: {
        token: token
    }
});


socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('new_user_created', (msg) => {
    createNewUser(msg)
});


socket.on('user_updated', (msg) => {
    updateUser(msg)
});


function createNewUser(user) {
    var new_element = `<tr id="user-${user.id}">
    <th class="user_id">${user.id}</th>
    <th class="user_name">${user.name}</th>
    <th class="user_email">${user.email}</th>
</tr>`

    $('#users').append(new_element)
}

function updateUser(user) {
    if ($('#users #user-' + user.id).length > 0) {
        $('#users #user-' + user.id).find('.user_name').text(user.name);
        $('#users #user-' + user.id).find('.user_email').text(user.email);
    }

}


window.addEventListener('beforeunload', () => {
    socket.disconnect();
    console.log('Socket connection closed.');
});