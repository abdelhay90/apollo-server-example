const {ForbiddenError} = require('apollo-server');
const {skip, combineResolvers} = require('graphql-resolvers');

const isAuthenticated = (parent, args, {me}) => me ? skip : new ForbiddenError('Not authenticated as user.');

const isMessageOwner = async (
    parent,
    {id},
    {models, me},
) => {
    const message = await models.Message.findByPk(id, {raw: true});

    if (message.userId !== me.id) {
        throw new ForbiddenError('Not authenticated as owner.');
    }

    return skip;
};

const isAdmin = combineResolvers(
    isAuthenticated,
    (parent, args, {me: {role}}) =>
        role === 'ADMIN'
            ? skip
            : new ForbiddenError('Not authorized as admin.'),
);

module.exports = {
    isAuthenticated,
    isMessageOwner,
    isAdmin: combineResolvers(
        isAuthenticated, isAdmin)
}
;
