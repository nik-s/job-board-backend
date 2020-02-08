const graphql = require('graphql')

const { GraphQLObjectType, GraphQLString, GraphQLBoolean, GraphQLID } = graphql
const { GraphQLDateTime } = require('graphql-iso-date')

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: {
      type: GraphQLID,
    },
    handle: {
      type: GraphQLString,
    },
    firstName: {
      type: GraphQLString,
    },
    lastName: {
      type: GraphQLString,
    },
    intro: {
      type: GraphQLString,
    },
    email: {
      type: GraphQLString,
    },
    date: {
      type: GraphQLDateTime,
    },
    success: {
      type: GraphQLBoolean,
    },
    token: {
      type: GraphQLString,
    },
    isAdmin: {
      type: GraphQLBoolean,
    },
  }),
})

module.exports = UserType
