(async () => {
    const Webhook = (await import('./webhook.js')).default;
    const wh = new Webhook();
    const SUBMITEMBED = {
        type: 'rich',
        color: 3205572,
        description: "[How to submit guild recruitment?](...)"
    };
    let EMOJI = '';
    const url = new URL(window.location);
    const COMPACTMODE = url.searchParams.has('compact')??false;
    async function load() {
        document.getElementById('webhook-load').addEventListener('click', () => {
            wh.url = document.getElementById('webhook-url').value;
            if (wh.url === "") {
                wh.url = undefined;
                localStorage.removeItem('recruit-guildinvite-webhookurl');
            }
            else localStorage.setItem('recruit-guildinvite-webhookurl', wh.url);
        });
        wh.url = localStorage.getItem('recruit-guildinvite-webhookurl');
        if (wh.url) document.getElementById('webhook-url').value = wh.url;
        document.getElementById('recruit-load').addEventListener('click', () => {
            const recurl = document.getElementById('webhook-url').value;
            if (recurl === "") {
                localStorage.removeItem('recruit-guildinvite-recruiturl');
            }
            else localStorage.setItem('recruit-guildinvite-recruiturl', recurl);
            SUBMITEMBED.description = `[How to submit guild recruitment?](${recurl})`;
        });
        if ((localStorage.getItem('recruit-guildinvite-recruiturl')??"")!=="") document.getElementById('recruit-url').value = localStorage.getItem('recruit-guildinvite-recruiturl');
        SUBMITEMBED.description = `[How to submit guild recruitment?](${document.getElementById('recruit-url').value})`;
        document.getElementById('emoji-load').addEventListener('click', () => {
            EMOJI = document.getElementById('emoji-string').value;
            if (EMOJI === "") {
                localStorage.removeItem('recruit-guildinvite-emoji');
            }
            else localStorage.setItem('recruit-guildinvite-emoji', EMOJI);
        });
        if ((localStorage.getItem('recruit-guildinvite-emoji')??"")!=="") document.getElementById('emoji-string').value = localStorage.getItem('recruit-guildinvite-emoji');
        EMOJI = document.getElementById('emoji-string').value;
        document.getElementById('messages').addEventListener('click', (e) => {
            if (!e.target.matches('button')) return;
            if (e.target.id === 'new-message-load') {
                const id = document.getElementById('new-message-id').value;
                if (id === "") return;
                if (loadMessage(id)) localStorage.setItem('recruit-guildinvite-messageids', [localStorage.getItem('recruit-guildinvite-messageids')??undefined, id].join('\n'));
                else alert('Message not found');
                document.getElementById('new-message-id').value = "";
                return;
            }
            if (e.target.classList.contains('message-delete')) {
                const parent = e.target.parentElement;
                const id = parent.querySelector('.message-id').value;
                if (!wh.deleteMessage(id)) alert('Failed to delete message\nYou might need to remove it manually');
                parent.remove();
                const ids = [];
                for (const child of document.getElementById('messages').children) {
                    if (!child.classList.contains('message')) continue;
                    ids.push(child.querySelector('.message-id').value);
                }
                if (ids.length === 0) localStorage.removeItem('recruit-guildinvite-messageids');
                else localStorage.setItem('recruit-guildinvite-messageids', ids.join('\n'));
                return;
            }
        });
        document.getElementById('guilds').addEventListener('click', async (e) => {
            if (!e.target.matches('button')) return;
            if (e.target.id === 'guild-commit') {
                const embeds = createEmbeds();
                const messages = [];
                let message = {
                    embeds: [],
                };
                messages.push(message);
                for (const embed of embeds) {
                    if (message.embeds.length >= 10) {
                        message = {
                            embeds: [],
                        };
                        messages.push(message);
                    }
                    message.embeds.push(embed);
                }
                const messageDoms = document.getElementById('messages').children;
                for (let mdom of messageDoms) {
                    if (!mdom.classList.contains('message')) continue;
                    const id = mdom.querySelector('.message-id').value;
                    if (messages.length <= 0) {
                        wh.deleteMessage(id);
                        mdom.remove();
                        continue;
                    }
                    const e = messages.shift();
                    if (!await wh.editMessage(id, e)) {
                        messages.unshift(e);
                        mdom.remove();
                    }
                }
                for (const message of messages) {
                    const id = (await wh.send(message,true)).id;
                    createMessageDom(id);
                }
                const ids = [];
                for (const child of document.getElementById('messages').children) {
                    if (!child.classList.contains('message')) continue;
                    ids.push(child.querySelector('.message-id').value);
                }
                if (ids.length === 0) localStorage.removeItem('recruit-guildinvite-messageids');
                else localStorage.setItem('recruit-guildinvite-messageids', ids.join('\n'));
                return;
            }
            if (e.target.id === 'new-guild-add') {
                if (document.getElementById('new-guild-name').value === "" || document.getElementById('new-guild-link').value === "") return;
                createGuildDom(document.getElementById('new-guild-name').value, document.getElementById('new-guild-link').value);
                document.getElementById('new-guild-name').value = "";
                document.getElementById('new-guild-link').value = "";
                return;
            }
            if (e.target.classList.contains('guild-delete')) {
                const parent = e.target.parentElement;
                parent.remove();
                return;
            }
        });
        const messageids = localStorage.getItem('recruit-guildinvite-messageids')??"";
        const messageidsarr = messageids.split('\n');
        for (const id of messageidsarr) {
            if (id === "") continue;
            loadMessage(id);
        }
    }
    async function loadMessage(id) {
        const message = await wh.getMessage(id);
        if (!message) return false;
        createMessageDom(id);
        for (let e of message.embeds) {
            if (e.type === 'rich' && e.color === SUBMITEMBED.color) continue;
            for (let g of e.description.matchAll(/\[(.*?)\]\((.*?)\)/g)) {
                createGuildDom(g[1], g[2]);
            }
        }
        return true;
    }
    function createMessageDom(id) {
        const MDOM = document.createElement('div');
        MDOM.classList.add('message');
        const MDOMIN = document.createElement('input');
        MDOMIN.type = 'text';
        MDOMIN.value = id;
        MDOMIN.classList.add('message-id');
        MDOMIN.setAttribute('readonly', 'readonly');
        const MDOMREM = document.createElement('button');
        MDOMREM.innerText = 'X';
        MDOMREM.classList.add('message-delete');
        MDOM.append(MDOMIN,MDOMREM);
        document.getElementById('messages').appendChild(MDOM);
    }
    function createGuildDom(name, link) {
        const GDOM = document.createElement('div');
        GDOM.classList.add('guild');
        const GDOMNAME = document.createElement('input');
        GDOMNAME.type = 'text';
        GDOMNAME.classList.add('guild-name');
        GDOMNAME.placeholder = 'Guild name';
        GDOMNAME.value = name;
        const GDOMLINK = document.createElement('input');
        GDOMLINK.type = 'url';
        GDOMLINK.classList.add('guild-link');
        GDOMLINK.placeholder = 'Guild link';
        GDOMLINK.value = link;
        const GDOMREM = document.createElement('button');
        GDOMREM.innerText = 'X';
        GDOMREM.classList.add('guild-delete');
        GDOM.append(GDOMNAME,GDOMLINK,GDOMREM);
        document.getElementById('guilds').appendChild(GDOM);
    }
    function createEmbeds() {
        const embeds = [];
        const guilds = [];
        for (let elem of document.getElementById('guilds').children) {
            if (!elem.classList.contains('guild')) continue;
            const guild = {
                name: elem.querySelector('.guild-name').value,
                url: elem.querySelector('.guild-link').value
            };
            guilds.push(guild);
        }
        let embed = {
            type: 'rich',
            color: 2811699,
            description: '',
        };
        if (guilds.length > 0) embeds.push(embed);
        for (let guild of guilds) {
            const newLine = COMPACTMODE ? `[${guild.name}](${guild.url})` : `${EMOJI} [${guild.name}](${guild.url})`;
            if (embed.description.length + newLine.length + (COMPACTMODE?3:1) >= 2048) {
                let embed = {
                    type: 'rich',
                    color: 2811699,
                    description: '',
                };
                embeds.push(embed);
            }
            embed.description = COMPACTMODE ? [embed.description,newLine].filter(v => v !== "").join(' | ') : [embed.description,newLine].filter(v => v !== "").join('\n');
        }
        embeds.push(Object.assign({timestamp: new Date().toISOString(), footer: {text: "Last updated"}},SUBMITEMBED));
        return embeds;
    }
    if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', load);
    else await load();
})();