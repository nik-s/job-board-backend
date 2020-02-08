const graphql = require('graphql')

const { GraphQLObjectType, GraphQLString, GraphQLList, GraphQLID } = graphql
const { GraphQLDateTime } = require('graphql-iso-date')
const UserType = require('./User')
const User = require('../../models/User')

const CvType = new GraphQLObjectType({
  name: 'Cv',
  fields: () => ({
    id: {
      type: GraphQLID,
    },
    userId: {
      type: GraphQLID,
    },
    user: {
      type: UserType,
      resolve(parent, _args) {
        return User.findById(parent.userId)
      },
    },
    experience: {
      type: new GraphQLList(GraphQLString),
    },
    education: {
      type: new GraphQLList(GraphQLString),
    },
    date: {
      type: GraphQLDateTime,
    },
  }),
})

module.exports = CvType
