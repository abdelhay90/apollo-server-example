const cors = require('cors');
const jwt = require('jsonwebtoken');
const {ApolloServer, AuthenticationError} = require('apollo-server-express');
const express = require('express');
const appSchema = require('./schema');
const appResolvers = require('./resolvers');
const {models, sequelize} = require('./models');
const http = require('http');

const app = express();
const eraseDatabaseOnSync = true;

app.use(cors());

const getMe = async req => {
    const token = req.headers['x-token'];

    if (token) {
        try {
            return await jwt.verify(token, process.env.SECRET);
        } catch (e) {
            throw new AuthenticationError(
                'Your session expired. Sign in again.',
            );
        }
    }
};

const server = new ApolloServer({
    typeDefs: appSchema,
    resolvers: appResolvers,
    formatError: error => {
        // remove the internal sequelize error message
        // leave only the important validation error
        const message = error.message
            .replace('SequelizeValidationError: ', '')
            .replace('Validation error: ', '');

        return {
            ...error,
            message,
        };
    },
    context: async ({req, connection}) => {
        if (connection) {
            return {
                models,
            };
        }

        if (req) {
            const me = await getMe(req);

            return {
                models,
                me,
                secret: process.env.SECRET,
            };
        }
    },
});

server.applyMiddleware({app, path: '/graphql'});

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

const createUsersWithMessages = async date => {
    await models.User.create(
        {
            username: 'rwieruch',
            email: 'hello@robin.com',
            password: 'rwieruch',
            role: 'ADMIN',
            messages: [
                {
                    text: 'Published the Road to learn React',
                    createdAt: date.setSeconds(date.getSeconds() + 1),
                },
            ],
        },
        {
            include: [models.Message],
        },
    );

    await models.User.create(
        {
            username: 'ddavids',
            email: 'hello@david.com',
            password: 'ddavids',
            messages: [
                {
                    text: 'Happy to release ...',
                    createdAt: date.setSeconds(date.getSeconds() + 1),
                },
                {
                    text: 'Published a complete ...',
                    createdAt: date.setSeconds(date.getSeconds() + 1),
                },
            ],
        },
        {
            include: [models.Message],
        },
    );
};

const isTest = !!process.env.TEST_DATABASE;
sequelize.sync({force: isTest}).then(async () => {
    if (isTest) {
        await createUsersWithMessages(new Date());
    }
    httpServer.listen({port: 8000}, () => {
        console.log('Apollo Server on http://localhost:8000/graphql');
    });
});


