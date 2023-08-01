const aliasForm = document.getElementById('aliasForm');
const aliasInputForm = document.getElementById('aliasInputForm');
const aliasId = document.getElementById('alias');
const resultForm = document.getElementById('resultForm');
const resultLabel = document.getElementById('resultLabel');
const copyBtn = document.getElementById('copyBtn');
const resultId = document.getElementById('result');

const error = (errorText) => {
    if (errorText) {
        resultLabel.innerText='Error';
        aliasId.classList.add('is-invalid');
        aliasInputForm.classList.add('is-invalid');
        resultId.value = errorText;
    } else {
        resultLabel.innerText='Room ID';
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
        let response;
        response = await fetch(`https://${server}/.well-known/matrix/client`);
        if (response.status === 404) {
            response = await fetch(`https://${server}/.well-known/matrix/server`);
        }
        const result = await response.json();
        return result['m.homeserver']?.base_url || `https://${result['m.server'].split(':')[0]}`;
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

const submitForm = async () => {
    error();
    const roomAlias = aliasId.value?.trim();

    const aliasRegex = /#[\w-_\+]+:[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
    if (!roomAlias.match(aliasRegex)) {
        return error(`Invalid alias: ${roomAlias}`);
    }

    let roomId = '';
    try {
        const server = roomAlias.split(':')[1];
        const url = await getServerDel(server);
        console.log(url)
        roomId = await resolveAlias(url, roomAlias);
    } catch (err) {
        return error(err);
    }

    return (resultId.value = roomId);
};

aliasForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitForm();
});

window.onload = async function () {
    document.querySelector('#current-url').textContent = window.location.host;
    document.querySelector('#query-help').textContent = window.location;
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    if (urlParams.has('alias')) {
        const alias = `#${urlParams.get('alias')}`;
        aliasId.value = alias;
        await submitForm();
    }
};
