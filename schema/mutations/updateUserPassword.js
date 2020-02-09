const graphql = require('graphql')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const authUser = require('../../auth/authUser')
const { GraphQLString, GraphQLNonNull, GraphQLID, GraphQLError } = graphql
const UserType = require('../types/User')
const User = require('../../models/User')
const validateUpdateInput = require('../../validation/updatePassword')

/**
 * @param {String} id
 * @param {Object} errors
 */
const findUser = function(id, errors) {
  return new Promise(function(resolve, reject) {
    User.findById(id).then(function(user) {
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
 * @param {Object} newUser
 * @param {String} password
 * @param {Object} errors
 */
const savePasswordAsHash = function(user, password, errors) {
  return new Promise(function(resolve, reject) {
    bcrypt.genSalt(10, (_err, salt) => {
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          errors.password = err.message
          reject({ errors })
        }
        user.password = hash
        resolve(user)
      })
    })
  })
}

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
    const { errors, isValid } = validateUpdateInput(args)
    const { id, password } = args

    return new Promise(function(res, rej) {
      if (!isValid) {
        rej({ errors })
      }

      authUser(request, response, errors)
        .then(function() {
          return findUser(id, errors)
        })
        .then(function(user) {
          return savePasswordAsHash(user, password)
        })
        .then(function(user) {
          return user.save()
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
                intro: user.intro,
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

module.exports = updateUserPassword
