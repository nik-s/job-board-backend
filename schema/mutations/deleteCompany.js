const graphql = require('graphql')
const bcrypt = require('bcryptjs')
const { GraphQLString, GraphQLID, GraphQLNonNull, GraphQLError } = graphql
const Company = require('../../models/Company')
const validateLoginInput = require('../../validation/login')
const CompanyType = require('../types/Company')
const authCompany = require('../../auth/authCompany')

/**
 * @param {String} email
 * @param {Object} errors
 */
const findCompany = function(email, errors) {
  return new Promise(function(resolve, reject) {
    Company.findOne({ email }).then(function(company) {
      if (!company) {
        errors.email = 'This company does not exist'
        reject({ errors })
      } else {
        resolve(company)
      }
    })
  })
}

/**
 * @param {String} password
 * @param {Object} company
 * @param {Object} errors
 */
const comparePasswords = function(password, company, errors) {
  return new Promise(function(resolve, reject) {
    bcrypt
      .compare(password, company.password)
      .then(function(isMatch) {
        if (isMatch) {
          resolve(company)
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

const deleteCompany = {
  type: CompanyType,
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

      authCompany(request, response, errors)
        .then(function() {
          return findCompany(email, errors)
        })
        .then(function(company) {
          return comparePasswords(password, company, errors)
        })
        .then(function() {
          Company.deleteOne({ email }, function(err) {
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

module.exports = deleteCompany
