let messagesQueue = [];

function add(user, message) {
    messagesQueue.push({
        user,
        message
    });
}

function popAll() {
    result = messagesQueue;
    messagesQueue = [];
    return result;
}

function shift() {
    return messagesQueue.shift();
}

module.exports = {
    add,
    popAll,
    shift
};