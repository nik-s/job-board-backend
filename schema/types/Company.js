const graphql = require('graphql')

const { GraphQLObjectType, GraphQLString, GraphQLBoolean, GraphQLID } = graphql
const { GraphQLDateTime } = require('graphql-iso-date')

const CompanyType = new GraphQLObjectType({
  name: 'Company',
  fields: () => ({
    id: {
      type: GraphQLID,
    },
    handle: {
      type: GraphQLString,
    },
    name: {
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
  }),
})

module.exports = CompanyType
