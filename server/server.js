const {GraphQLServer, PubSub} = require('graphql-yoga')

//empty array to store data from gql queries
const messages = []

//Describe graphql schema
const typeDefs = `
    type Message {
        id: ID!
        user: String!
        content: String!
    }

    type Query {
        messages: [Message!]
    }

    type Mutation {
        postMessage(user: String!, content: String!): ID!
    }

    type Subscription {
        messages: [Message!]
    }
`

//persistent list of subscribers on channels
const subscribers = []
const onMessagesUpdates = (fn) => subscribers.push(fn)

//resolvers that correspond to every typedef
const resolvers = {
    Query: {
        messages: () => messages,
    },
    Mutation: {
        postMessage: (parent, {user, content}) => {
            const id = messages.length
            messages.push({
                id,
                user,
                content
            })
            subscribers.forEach((fn) => fn())
            return id
        },
    },
    Subscription: {
        messages: {
            subscribe: (parent, args, { pubsub }) => {
                const channel = Math.random().toString(36).slice(2,15)
                onMessagesUpdates(() => pubsub.publish(channel, { messages }))
                setTimeout(() => pubsub.publish(channel, { messages }), 0)
                return pubsub.asyncIterator(channel)
            }
        }
    }
}

// Publish Subscribe handler for GQL yoga
const pubsub = new PubSub()

const server = new GraphQLServer({ typeDefs, resolvers, context: {pubsub} })
server.start(({port}) => {
    console.log(`Server on http://localhost:${port}/`)
})