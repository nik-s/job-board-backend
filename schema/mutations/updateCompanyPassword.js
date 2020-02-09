const graphql = require('graphql')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const authCompany = require('../../auth/authCompany')
const { GraphQLString, GraphQLNonNull, GraphQLID, GraphQLError } = graphql
const CompanyType = require('../types/Company')
const Company = require('../../models/Company')
const validateUpdateInput = require('../../validation/updatePassword')

/**
 * @param {String} id
 * @param {Object} errors
 */
const findCompany = function(id, errors) {
  return new Promise(function(resolve, reject) {
    Company.findById(id).then(function(company) {
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
 * @param {Object} newCompany
 * @param {String} password
 * @param {Object} errors
 */
const savePasswordAsHash = function(company, password, errors) {
  return new Promise(function(resolve, reject) {
    bcrypt.genSalt(10, (_err, salt) => {
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          errors.password = err.message
          reject({ errors })
        }
        company.password = hash
        resolve(company)
      })
    })
  })
}

const updateCompanyPassword = {
  type: CompanyType,
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

      authCompany(request, response, errors)
        .then(function() {
          return findCompany(id, errors)
        })
        .then(function(company) {
          return savePasswordAsHash(company, password)
        })
        .then(function(company) {
          return company.save()
        })
        .then(function(company) {
          const payload = { id: company.id, handle: company.handle }

          jwt.sign(
            payload,
            process.env.SECRET_OR_KEY,
            { expiresIn: 3600 },
            (_err, token) => {
              res({
                id: company.id,
                name: company.name,
                handle: company.handle,
                email: company.email,
                intro: company.intro,
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

module.exports = updateCompanyPassword
