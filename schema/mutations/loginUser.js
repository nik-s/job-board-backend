const graphql = require('graphql')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../../models/User')
const validateLoginInput = require('../../validation/login')

const UserType = require('../types/User')

const { GraphQLString, GraphQLNonNull, GraphQLError } = graphql

const loginUser = {
  type: UserType,
  args: {
    email: {
      type: new GraphQLNonNull(GraphQLString),
    },
    password: {
      type: new GraphQLNonNull(GraphQLString),
    },
  },
  resolve(_parent, args) {
    const { errors, isValid } = validateLoginInput(args)
    const { email, password } = args
    return new Promise((res, rej) => {
      if (!isValid) {
        rej({ errors })
      }

      User.findOne({ email }).then(user => {
        if (!user) {
          errors.email = 'This user does not exist'
          rej({ errors })
        }

        bcrypt.compare(password, user.password).then(isMatch => {
          if (isMatch) {
            const payload = { id: user.id, handle: user.handle }

            jwt.sign(
              payload,
              process.env.SECRET_OR_KEY,
              // Tell the key to expire in one hour
              { expiresIn: 3600 },
              (_err, token) => {
                res({
                  id: user.id,
                  handle: user.handle,
                  email: user.email,
                  success: true,
                  token: 'Bearer ' + token,
                  isAdmin: user.isAdmin,
                })
              }
            )
          } else {
            errors.password = 'Incorrect password'
            rej({ errors })
          }
        })
      })
    }).catch(err => {
      const keys = Object.keys(err.errors)
      keys.map(key => {
        throw new GraphQLError(errors[key])
      })
    })
  },
}

module.exports = loginUser
