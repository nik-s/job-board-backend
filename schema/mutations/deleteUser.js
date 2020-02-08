const graphql = require('graphql')
const bcrypt = require('bcryptjs')
const { GraphQLString, GraphQLID, GraphQLNonNull, GraphQLError } = graphql
const User = require('../../models/User')
const validateLoginInput = require('../../validation/login')
const UserType = require('../types/User')
const authUser = require('../../auth/authUser')

const deleteUser = {
  type: UserType,
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    email: {
      type: new GraphQLNonNull(GraphQLString),
    },
    password: {
      type: new GraphQLNonNull(GraphQLString),
    },
  },
  resolve(_parent, args, request, response) {
    const { errors, isValid } = validateLoginInput(args)
    const { email, password } = args

    return new Promise((res, rej) => {
      if (!isValid) {
        rej({ errors })
      }

      return authUser(request, response)
        .then(() => {
          User.findOne({ email }).then(user => {
            if (!user) {
              errors.email = 'This user does not exist'
              rej({ errors })
            }

            bcrypt.compare(password, user.password).then(isMatch => {
              if (isMatch) {
                User.deleteOne({ email }, err => {
                  if (err && err.message) throw new GraphQLError(err.message)
                  res({
                    success: true,
                  })
                })
              } else {
                errors.password = 'Incorrect password'
                rej({ errors })
              }
            })
          })
        })
        .catch(err => {
          rej({ ...errors, error: err.message })
        })
    }).catch(err => {
      const keys = Object.keys(err.errors)
      keys.map(key => {
        throw new GraphQLError(errors[key])
      })
    })
  },
}

module.exports = deleteUser
