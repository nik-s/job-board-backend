const graphql = require('graphql')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Company = require('../../models/Company')
const validateRegisterInput = require('../../validation/registerCompany')
const CompanyType = require('../types/Company')
const { GraphQLString, GraphQLNonNull, GraphQLError } = graphql

/**
 *
 * @param {String} email
 * @param {String} handle
 * @param {Object} errors
 */
const checkIfCompanyExists = function(email, handle, errors) {
  return new Promise(function(resolve, reject) {
    Company.findOne({ email }).then(company => {
      if (company) {
        errors.handle = 'Company already exists'
        reject({ errors })
      } else {
        Company.findOne({ handle }).then(company => {
          if (company) {
            errors.handle = 'Company already exists'
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
const savePasswordAsHash = function(newCompany, password, errors) {
  return new Promise(function(resolve, reject) {
    bcrypt.genSalt(10, (_err, salt) => {
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          errors.password = err.message
          reject({ errors })
        }
        newCompany.password = hash
        resolve(newCompany)
      })
    })
  })
}

const registerCompany = {
  type: CompanyType,
  args: {
    name: {
      type: new GraphQLNonNull(GraphQLString),
    },
    intro: {
      type: GraphQLString,
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
    const { name, intro, handle, email, password } = args
    const { errors, isValid } = validateRegisterInput(args)
    return new Promise((res, rej) => {
      if (!isValid) {
        rej({ errors })
      }

      checkIfCompanyExists()
        .then(function() {
          const newCompany = new Company({
            name,
            intro,
            handle,
            email,
            password,
          })

          return savePasswordAsHash(newCompany, password, errors)
        })
        .then(function(newCompany) {
          return newCompany.save()
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
                handle: company.handle,
                email: company.email,
                name: company.name,
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

module.exports = registerCompany
