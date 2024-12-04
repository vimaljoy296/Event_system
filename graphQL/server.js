const { ApolloServer } = require("apollo-server");
const typeDefs = require("./schema");
const resolvers = require("./resolver");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers.authorization || "";
    return { token };
  },
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
