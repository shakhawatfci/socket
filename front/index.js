const socket = io("http://localhost:8080");

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