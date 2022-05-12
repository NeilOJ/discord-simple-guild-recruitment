
function Webhook(url) {
    if (!new.target) return new Webhook(...arguments);
    this.url = url;
}

Webhook.prototype.send = async function send (data,wait=false) {
    if (!this.url) throw new Error('No Webhook URL specified');
    if (typeof data === "string") data = { content: data };
    const request = new Request(this.url + (wait?'?wait=true':''), {method: 'POST', headers: {"Content-Type": 'application/json'}, body: JSON.stringify(data)});
    const response = await fetch(request);
    if (!response.ok) return undefined;
    return await response.json();
};
Webhook.prototype.getMessage = async function getMessage (id) {
    if (!this.url) throw new Error('No Webhook URL specified');
    if (typeof id !== "string") throw new Error('ID must be a string');
    const request = new Request(this.url + '/messages/' + id, {method: 'GET', headers: {"Content-Type": 'application/json'}});
    const response = await fetch(request);
    if (!response.ok) return undefined;
    return await response.json();
};
Webhook.prototype.editMessage = async function editMessage (id, data) {
    if (!this.url) throw new Error('No Webhook URL specified');
    if (typeof id !== "string") throw new Error('ID must be a string');
    if (typeof data === "string") data = { content: data };
    const request = new Request(this.url + '/messages/' + id, {method: 'PATCH', headers: {"Content-Type": 'application/json'}, body: JSON.stringify(data)});
    const response = await fetch(request);
    return response.ok;
};
Webhook.prototype.deleteMessage = async function deleteMessage (id){
    if (!this.url) throw new Error('No Webhook URL specified');
    if (typeof id !== "string") throw new Error('ID must be a string');
    const request = new Request(this.url + '/messages/' + id, {method: 'DELETE', headers: {"Content-Type": 'application/json'}});
    const response = await fetch(request);
    return response.ok;
};

export { Webhook as default };