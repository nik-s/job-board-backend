const graphql = require('graphql')
const authCompany = require('../../auth/authCompany')
const { GraphQLString, GraphQLNonNull, GraphQLID, GraphQLError } = graphql
const JobType = require('../types/Job')
const Job = require('../../models/Job')

/**
 * @param {String} id
 */
const findJob = function(id, errors) {
  return new Promise(function(resolve, reject) {
    Job.findById(id)
      .then(function(job) {
        resolve(job)
      })
      .catch(function(err) {
        errors.job = err.message
        reject({ errors })
      })
  })
}

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
    const { id, companyId, title, description } = args
    let errors = {}
    return new Promise(function(res, rej) {
      authCompany(request, response, errors)
        .then(function(company) {
          if (company.id !== companyId) {
            errors.auth = 'Unauthorized'
            rej({ errors })
          }

          return findJob(id, errors)
        })
        .then(function(job) {
          if (title) job.title = title
          if (description) job.description = description
          return job.save()
        })
        .then(function(job) {
          res(job)
        })
        .catch(function(err) {
          rej({ errors: err.errors })
        })
    }).catch(err => {
      const keys = Object.keys(err.errors)
      keys.map(key => {
        throw new GraphQLError(errors[key])
      })
    })
  },
}

module.exports = updateJob
