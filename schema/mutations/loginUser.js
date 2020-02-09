const graphql = require('graphql')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../../models/User')
const UserType = require('../types/User')
const validateLoginInput = require('../../validation/login')
const { GraphQLString, GraphQLNonNull, GraphQLError } = graphql

/**
 * @param {String} email
 * @param {Object} errors
 */
const findUser = function(email, errors) {
  return new Promise(function(resolve, reject) {
    User.findOne({ email }).then(function(user) {
      if (!user) {
        errors.email = 'This user does not exist'
        reject({ errors })
      } else {
        resolve(user)
      }
    })
  })
}

/**
 * @param {String} password
 * @param {Object} user
 * @param {Object} errors
 */
const comparePasswords = function(password, user, errors) {
  return new Promise(function(resolve, reject) {
    bcrypt
      .compare(password, user.password)
      .then(function(isMatch) {
        if (isMatch) {
          resolve(user)
        } else {
          errors.password = 'Incorrect password'
          reject({ errors })
        }
      })
      .catch(function(err) {
        errors.password = err.message
        reject({ errors })
      })
  })
}

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

      findUser(email, errors)
        .then(function(user) {
          return comparePasswords(password, user, errors)
        })
        .then(function(user) {
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

module.exports = loginUser
