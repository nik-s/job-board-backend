const graphql = require('graphql')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../../models/User')
const validateRegisterInput = require('../../validation/registerUser')
const UserType = require('../types/User')
const { GraphQLString, GraphQLNonNull, GraphQLError } = graphql

/**
 *
 * @param {String} email
 * @param {String} handle
 * @param {Object} errors
 */
const checkIfUserExists = function(email, handle, errors) {
  return new Promise(function(resolve, reject) {
    User.findOne({ email }).then(user => {
      if (user) {
        errors.handle = 'User already exists'
        reject({ errors })
      } else {
        User.findOne({ handle }).then(user => {
          if (user) {
            errors.handle = 'User already exists'
            reject({ errors })
          } else {
            resolve()
          }
        })
      }
    })
  })
}

/**
 * @param {Object} newUser
 * @param {String} password
 * @param {Object} errors
 */
const savePasswordAsHash = function(newUser, password, errors) {
  return new Promise(function(resolve, reject) {
    bcrypt.genSalt(10, (_err, salt) => {
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          errors.password = err.message
          reject({ errors })
        }
        newUser.password = hash
        resolve(newUser)
      })
    })
  })
}

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

    return new Promise(function(res, rej) {
      if (!isValid) {
        rej({ errors })
      }

      checkIfUserExists(email, handle, errors)
        .then(function() {
          const newUser = new User({
            firstName,
            lastName,
            handle,
            email,
            password,
          })

          return savePasswordAsHash(newUser, password, errors)
        })
        .then(function(newUser) {
          return newUser.save()
        })
        .then(function(user) {
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

module.exports = registerUser
