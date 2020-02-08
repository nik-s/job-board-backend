const graphql = require('graphql')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../../models/User')
const validateRegisterInput = require('../../validation/registerUser')

const UserType = require('../types/User')

const { GraphQLString, GraphQLNonNull, GraphQLError } = graphql

const registerUser = {
  type: UserType,
  args: {
    firstName: {
      type: new GraphQLNonNull(GraphQLString),
    },
    lastName: {
      type: new GraphQLNonNull(GraphQLString),
    },
    handle: {
      type: new GraphQLNonNull(GraphQLString),
    },
    email: {
      type: new GraphQLNonNull(GraphQLString),
    },
    password: {
      type: new GraphQLNonNull(GraphQLString),
    },
    password2: {
      type: new GraphQLNonNull(GraphQLString),
    },
  },
  resolve(_parent, args) {
    const { firstName, lastName, handle, email, password } = args
    const { errors, isValid } = validateRegisterInput(args)
    return new Promise((res, rej) => {
      if (!isValid) {
        rej({ errors })
      }

      const createNewUser = () => {
        const newUser = new User({
          firstName,
          lastName,
          handle,
          email,
          password,
        })

        bcrypt.genSalt(10, (_err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw new GraphQLError(JSON.stringify(err))
            newUser.password = hash
            newUser
              .save()
              .then(user => {
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
              .catch(err => {
                rej({ ...errors, error: err.message })
              })
          })
        })
      }

      User.findOne({ email }).then(user => {
        if (user) {
          errors.handle = 'User already exists'
          rej({ errors })
        } else {
          User.findOne({ handle }).then(user => {
            if (user) {
              errors.handle = 'User already exists'
              rej({ errors })
            } else {
              createNewUser()
            }
          })
        }
      })
    }).catch(err => {
      const keys = Object.keys(err.errors)
      keys.map(key => {
        throw new GraphQLError(errors[key])
      })
    })
  },
}

module.exports = registerUser
