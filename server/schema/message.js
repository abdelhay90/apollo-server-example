const {gql} = require('apollo-server-express');

module.exports = gql`
    extend type Query {
        messages(cursor: String, limit: Int): MessageConnection!
        message(id: ID!): Message!
    }

    extend type Mutation {
        createMessage(text: String!): Message!
        deleteMessage(id: ID!): Boolean!
    }

    type MessageConnection {
        edges: [Message!]!
        pageInfo: PageInfo!
    }

    type PageInfo {
        endCursor: String!
        hasNextPage: Boolean!
    }

    type Message {
        id: ID!
        text: String!
        user: User!
        createdAt: Date!
    }
`;
