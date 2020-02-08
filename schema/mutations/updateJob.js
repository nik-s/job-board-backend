const graphql = require('graphql')
const authCompany = require('../../auth/authCompany')
const { GraphQLString, GraphQLNonNull, GraphQLID, GraphQLError } = graphql
const JobType = require('../types/Job')
const Job = require('../../models/Job')

const updateJob = {
  type: JobType,
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    companyId: {
      type: new GraphQLNonNull(GraphQLID),
    },
    title: {
      type: GraphQLString,
    },
    description: {
      type: GraphQLString,
    },
  },
  resolve(_parent, args, request, response) {
    return authCompany(request, response)
      .then(company => {
        return new Promise((res, rej) => {
          const { id, companyId, title, description } = args
          if (company.id !== companyId) {
            rej({ message: 'Unauthorized' })
          }

          Job.findById(id)
            .then(job => {
              if (title) job.title = title
              if (description) job.description = description
              job.save()
              res(job)
            })
            .catch(err => {
              rej({ message: err.message })
            })
        }).catch(err => {
          rej({ message: err.message })
        })
      })
      .catch(err => {
        if (err.message) throw new GraphQLError(err.message)
      })
  },
}

module.exports = updateJob
