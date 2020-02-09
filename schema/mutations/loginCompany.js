const graphql = require('graphql')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Company = require('../../models/Company')
const validateLoginInput = require('../../validation/login')
const CompanyType = require('../types/Company')
const { GraphQLString, GraphQLNonNull, GraphQLError } = graphql

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

const loginCompany = {
  type: CompanyType,
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

      findCompany(email, errors)
        .then(function(company) {
          return comparePasswords(password, company, errors)
        })
        .then(function(company) {
          const payload = { id: company.id, handle: company.handle }

          jwt.sign(
            payload,
            process.env.SECRET_OR_KEY,
            // Tell the key to expire in one hour
            { expiresIn: 3600 },
            (_err, token) => {
              res({
                id: company.id,
                name: company.name,
                handle: company.handle,
                email: company.email,
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

module.exports = loginCompany
