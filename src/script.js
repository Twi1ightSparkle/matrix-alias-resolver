const getServer = (alias) => {
    return server = alias.split(':')[1];
};

const getServerDel = async (server) => {
    try {
        const response = await fetch(`https://${server}/.well-known/matrix/client`);
        const result = await response.json();
        return result['m.homeserver'].base_url;
    } catch (err) {
        console.error(`Unable to fetch ${server} well-knowns: ${err}`);
        throw new Error(`Unable to resolve ${server}`);
    }
};

const resolveAlias = async (url, alias) => {
    try {
        const encoded = encodeURIComponent(alias);
        const response = await fetch(`${url}/_matrix/client/r0/directory/room/${encoded}`)
        if (response.status != 200) throw new Error();
        const result = await response.json();
        return result.room_id;
    } catch (err) {
        console.error(`Unable to resolve alias ${alias}: ${err}`);
        throw new Error(`Unable to resolve alias ${alias}`);
    }
};

document.querySelector('#aForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const roomAlias = document.getElementById('alias').value;
    const result = document.getElementById('roomId');
    result.textContent = '';

    const aliasRegex = /#[\w-_\+]+:[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
    if (!roomAlias.match(aliasRegex)) {
        return result.textContent = `Invalid alias: ${roomAlias}`;
    }

    let res = '';
    try {
        const server = getServer(roomAlias);
        const url = await getServerDel(server);
        const roomId = await resolveAlias(url, roomAlias);
        res = `Room ID: ${roomId}`;
    } catch (err) {
        res = err;
    }

    return result.textContent = res;
});
