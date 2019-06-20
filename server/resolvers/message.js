const {ForbiddenError} = require('apollo-server');
const {combineResolvers} = require('graphql-resolvers');
const {isAuthenticated, isMessageOwner} = require('./authorization');

module.exports = {
    Query: {
        messages: async (parent, {offset = 0, limit = 100}, {models},) => {
            return await models.Message.findAll({
                offset, limit
            });
        },
        message: async (parent, {id}, {models}) => {
            return await models.Message.findByPk(id);
        },
    },

    Mutation: {
        createMessage: combineResolvers(
            isAuthenticated,
            async (parent, {text}, {me, models}) => {
                if (!me) {
                    throw new ForbiddenError('Not authenticated as user.');
                }
                try {
                    return await models.Message.create({
                        text,
                        userId: me.id,
                    });
                } catch (error) {
                    throw new Error(error);
                }
            }),

        deleteMessage: combineResolvers(
            isAuthenticated,
            isMessageOwner,
            async (parent, {id}, {models}) => {
                return await models.Message.destroy({where: {id}});
            },
        ),
    },

    Message: {
        user: async (message, args, {models}) => {
            return await models.User.findByPk(message.userId);
        },
    },
};
