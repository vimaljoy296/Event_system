const { gql } = require('apollo-server');

const typeDefs = gql`
    type Event {
        id: ID!
        name: String!
        description: String!
        date: String!
        capacity: Int!
        participants: [User!]!
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
        fetchUserEvents(userId: ID!): [Event!]  # New query for fetching events registered by a user
    }

    type Mutation {
        login(email: String!, password: String!): AuthPayload!
        addEvent(name: String!, description: String!, date: String!, capacity: Int!): Event
        deleteEvent(eventId: ID!): Event
        registerForEvent(eventId: ID!, userId: ID!): Event  # Ensure it returns an Event
        addUser(name: String!, email: String!, password: String!, role: String!): User
        updateEventCapacity(eventId: ID!, capacity: Int!): Event
    }
`;

module.exports = typeDefs;
