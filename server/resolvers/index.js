const userResolvers = require('./user');
const messageResolvers = require('./message');
const { GraphQLDateTime } = require('graphql-iso-date');

const customScalarResolver = {
    Date: GraphQLDateTime,
};

module.exports = [customScalarResolver, userResolvers, messageResolvers];
