const graphql = require('graphql')
const authUser = require('../../auth/authUser')
const {
  GraphQLString,
  GraphQLNonNull,
  GraphQLList,
  GraphQLID,
  GraphQLError,
} = graphql
const CvType = require('../types/Cv')
const Cv = require('../../models/Cv')

/**
 * @param {String} id
 */
const findCv = function(id, errors) {
  return new Promise(function(resolve, reject) {
    Cv.findById(id)
      .then(function(cv) {
        resolve(cv)
      })
      .catch(function(err) {
        errors.cv = err.message
        reject({ errors })
      })
  })
}

const updateCv = {
  type: CvType,
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID),
    },
    experience: {
      type: new GraphQLList(GraphQLString),
    },
    education: {
      type: new GraphQLList(GraphQLString),
    },
  },
  resolve(_parent, args, request, response) {
    const { id, userId, experience, education } = args
    let errors = {}
    return new Promise(function(res, rej) {
      authUser(request, response, errors)
        .then(function(user) {
          if (user.id !== userId) {
            errors.auth = 'Unauthorized'
            rej({ errors })
          }

          return findCv(id, errors)
        })
        .then(function(cv) {
          if (experience) cv.experience = experience
          if (education) cv.education = education
          return cv.save()
        })
        .then(function(cv) {
          res(cv)
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

module.exports = updateCv
