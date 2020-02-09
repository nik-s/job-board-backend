const graphql = require('graphql')
const authUser = require('../../auth/authUser')
const { GraphQLString, GraphQLNonNull, GraphQLID, GraphQLError } = graphql
const UserType = require('../types/User')
const User = require('../../models/User')
const validateUpdateInput = require('../../validation/updateUser')

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
 * @param {String} handle
 * @param {Object} user
 */
const updateHandle = function(handle, user) {
  return new Promise(function(resolve, reject) {
    if (handle) {
      User.findOne({ handle }).then(function(existingUser) {
        if (existingUser) {
          errors.handle = 'User already exists'
          reject({ errors })
        } else {
          user.handle = handle
          resolve(user)
        }
      })
    } else {
      resolve(user)
    }
  })
}

/**
 * @param {String} email
 * @param {Object} user
 */
const updateEmail = function(email, user) {
  return new Promise((resolve, reject) => {
    if (email) {
      User.findOne({ email }).then(existingUser => {
        if (existingUser) {
          errors.email = 'User already exists'
          reject({ errors })
        } else {
          user.email = email
          resolve(user)
        }
      })
    } else {
      resolve(user)
    }
  })
}

const updateUser = {
  type: UserType,
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    handle: {
      type: GraphQLString,
    },
    firstName: {
      type: GraphQLString,
    },
    lastName: {
      type: GraphQLString,
    },
    intro: {
      type: GraphQLString,
    },
    email: {
      type: GraphQLString,
    },
  },
  resolve(_parent, args, request, response) {
    const { errors, isValid } = validateUpdateInput(args)
    const { id, handle, firstName, lastName, intro, email } = args
    return new Promise(function(res, rej) {
      authUser(request, response, errors)
        .then(() => {
          if (!isValid) {
            rej({ errors })
          }

          findUser(id, errors)
            .then(function(user) {
              return updateHandle(handle, user)
            })
            .then(function(user) {
              return updateEmail(email, user)
            })
            .then(function(user) {
              if (firstName) user.firstName = firstName
              if (lastName) user.lastName = lastName
              if (intro) user.intro = intro

              return user.save()
            })
            .then(function(user) {
              res(user)
            })
            .catch(function(err) {
              rej({ errors: err.errors })
            })
        })
        .catch(function(err) {
          rej({ errors: err.errors })
        })
    }).catch(err => {
      const keys = Object.keys(err.errors)
      keys.map(key => {
        throw new GraphQLError(err.errors[key])
      })
    })
  },
}

module.exports = updateUser
