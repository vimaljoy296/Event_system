const { gql } = require('apollo-server');

const typeDefs = gql`
    type Event {
        id: ID!
        name: String!
        description: String!
        date: String!
        capacity: Int!
        participants: [User!]!  # Make sure to resolve this in the resolver
    }

    type User {
        id: ID!
        name: String!
        email: String!
        role: String!
    }

    type AuthPayload {
        token: String!
        user: User!
    }

    type Query {
        fetchEvents: [Event!]!
        fetchUserDetails(userId: ID!): User
    }

    type Mutation {
        login(email: String!, password: String!): AuthPayload!
        addEvent(name: String!, description: String!, date: String!, capacity: Int!): Event
        deleteEvent(eventId: ID!): Event
        registerForEvent(eventId: ID!, userId: ID!): Event
        addUser(name: String!, email: String!, password: String!, role: String!): User  # New mutation to add a user
        updateEventCapacity(eventId: ID!, capacity: Int!): Event  # New mutation to update event capacity
    }
`;

module.exports = typeDefs;
