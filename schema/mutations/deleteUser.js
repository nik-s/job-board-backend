const graphql = require('graphql')
const bcrypt = require('bcryptjs')
const { GraphQLString, GraphQLID, GraphQLNonNull, GraphQLError } = graphql
const User = require('../../models/User')
const validateLoginInput = require('../../validation/login')
const UserType = require('../types/User')
const authUser = require('../../auth/authUser')

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

      authUser(request, response, errors)
        .then(function() {
          return findUser(email, errors)
        })
        .then(function(user) {
          return comparePasswords(password, user, errors)
        })
        .then(function() {
          User.deleteOne({ email }, function(err) {
            if (err) {
              errors.removal = err.message
              rej({ errors })
            }
            res({
              success: true,
            })
          })
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

module.exports = deleteUser
