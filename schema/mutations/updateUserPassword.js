const graphql = require('graphql')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const authUser = require('../../auth/authUser')
const { GraphQLString, GraphQLNonNull, GraphQLID, GraphQLError } = graphql
const UserType = require('../types/User')
const User = require('../../models/User')
const validateUpdateInput = require('../../validation/updatePassword')

const updateUserPassword = {
  type: UserType,
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    password: {
      type: new GraphQLNonNull(GraphQLString),
    },
    password2: {
      type: new GraphQLNonNull(GraphQLString),
    },
  },
  resolve(_parent, args, request, response) {
    return authUser(request, response)
      .then(() => {
        const { errors, isValid } = validateUpdateInput(args)
        return new Promise((res, rej) => {
          if (!isValid) {
            rej({ errors })
          }

          const { id, password } = args

          User.findById(id)
            .then(user => {
              bcrypt.genSalt(10, (_err, salt) => {
                bcrypt.hash(password, salt, (err, hash) => {
                  if (err) throw new GraphQLError(JSON.stringify(err))
                  user.password = hash
                  user.save().then(user => {
                    const payload = { id: user.id, handle: user.handle }

                    jwt.sign(
                      payload,
                      process.env.SECRET_OR_KEY,
                      { expiresIn: 3600 },
                      (_err, token) => {
                        res({
                          id: user.id,
                          firstName: user.firstName,
                          lastName: user.lastName,
                          handle: user.handle,
                          email: user.email,
                          success: true,
                          token: 'Bearer ' + token,
                        })
                      }
                    )
                  })
                })
              })
            })
            .catch(err => {
              rej({ ...errors, error: err.message })
            })
        }).catch(err => {
          rej({ ...errors, error: err.message })
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

module.exports = updateUserPassword
