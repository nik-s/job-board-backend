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
    return authUser(request, response)
      .then(user => {
        return new Promise((res, rej) => {
          const { id, userId, experience, education } = args
          if (user.id !== userId) {
            rej({ message: 'Unauthorized' })
          }

          Cv.findById(id)
            .then(cv => {
              if (experience) cv.experience = experience
              if (education) cv.education = education
              cv.save()
              res(cv)
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

module.exports = updateCv
