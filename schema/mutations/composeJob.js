const graphql = require('graphql')
const { GraphQLString, GraphQLNonNull, GraphQLID, GraphQLError } = graphql
const authCompany = require('../../auth/authCompany')
const JobType = require('../types/Job')
const Job = require('../../models/Job')

const composeJob = {
  type: JobType,
  args: {
    companyId: {
      type: GraphQLID,
    },
    title: {
      type: new GraphQLNonNull(GraphQLString),
    },
    description: {
      type: new GraphQLNonNull(GraphQLString),
    },
  },
  resolve(_parent, args, request, response) {
    let errors = {}
    return authCompany(request, response, errors)
      .then(() => {
        const newJob = new Job({
          companyId: args.companyId,
          title: args.title,
          description: args.description,
        })

        return newJob.save().then(job => {
          return job
        })
      })
      .catch(err => {
        const keys = Object.keys(err.errors)
        keys.map(key => {
          throw new GraphQLError(errors[key])
        })
      })
  },
}

module.exports = composeJob
