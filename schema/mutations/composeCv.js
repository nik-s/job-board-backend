const graphql = require('graphql')
const authUser = require('../../auth/authUser')
const { GraphQLString, GraphQLList, GraphQLID, GraphQLError } = graphql
const CvType = require('../types/Cv')
const Cv = require('../../models/Cv')

const composeCv = {
  type: CvType,
  args: {
    userId: {
      type: GraphQLID,
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
      .then(() => {
        const newCv = new Cv({
          userId: args.userId,
          experience: args.experience,
          education: args.education,
        })

        return newCv.save().then(job => {
          return job
        })
      })
      .catch(err => {
        throw new GraphQLError(err.message)
      })
  },
}

module.exports = composeCv
