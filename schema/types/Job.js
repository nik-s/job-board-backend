const graphql = require('graphql')

const { GraphQLObjectType, GraphQLString, GraphQLID } = graphql
const { GraphQLDateTime } = require('graphql-iso-date')
const CompanyType = require('./Company')
const Company = require('../../models/Company')

const JobType = new GraphQLObjectType({
  name: 'Job',
  fields: () => ({
    id: {
      type: GraphQLID,
    },
    companyId: {
      type: GraphQLID,
    },
    company: {
      type: CompanyType,
      resolve(parent, _args) {
        return Company.findById(parent.companyId)
      },
    },
    title: {
      type: GraphQLString,
    },
    description: {
      type: GraphQLString,
    },
    date: {
      type: GraphQLDateTime,
    },
  }),
})

module.exports = JobType
