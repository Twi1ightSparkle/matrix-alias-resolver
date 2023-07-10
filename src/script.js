const aliasForm = document.getElementById('aliasForm');
const aliasInputForm = document.getElementById('aliasInputForm');
const aliasId = document.getElementById('alias');
const resultForm = document.getElementById('resultForm');
const copyBtn = document.getElementById('copyBtn');
const resultId = document.getElementById('result');

const error = (errorText) => {
    if (errorText) {
        aliasId.classList.add('is-invalid');
        aliasInputForm.classList.add('is-invalid');
        resultId.value = errorText;
    } else {
        aliasId.classList.remove('is-invalid');
        aliasInputForm.classList.remove('is-invalid');
        resultId.value = '';
    }
};

const copy = () => {
    navigator.clipboard.writeText(resultId.value);

    copyBtn.textContent = 'Copied ✅';
    setTimeout(() => {
        copyBtn.textContent = 'Copy 💾';
    }, 2000);
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
        const response = await fetch(`${url}/_matrix/client/r0/directory/room/${encoded}`);
        if (response.status != 200) throw new Error();
        const result = await response.json();
        return result.room_id;
    } catch (err) {
        console.error(`Unable to resolve alias ${alias}: ${err}`);
        throw new Error(`Unable to resolve alias ${alias}`);
    }
};

aliasForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    error();
    const roomAlias = aliasId.value;

    const aliasRegex = /#[\w-_\+]+:[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
    if (!roomAlias.match(aliasRegex)) {
        return error(`Invalid alias: ${roomAlias}`);
    }

    let roomId = '';
    try {
        const server = roomAlias.split(':')[1];
        const url = await getServerDel(server);
        roomId = await resolveAlias(url, roomAlias);
    } catch (err) {
        return error(err);
    }

    return (resultId.value = roomId);
});

window.onload = function () {
    document.querySelector('#current-url').textContent = window.location.host;
};
