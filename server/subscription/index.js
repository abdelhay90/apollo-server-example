const {PubSub} = require('apollo-server');

const MESSAGE_EVENTS = require('./message');

const EVENTS = {
    MESSAGE: MESSAGE_EVENTS,
};

module.exports = {
    pubsub: new PubSub(),
    EVENTS
};
