const graphql = require('graphql')
const authCompany = require('../../auth/authCompany')
const { GraphQLString, GraphQLNonNull, GraphQLID, GraphQLError } = graphql
const CompanyType = require('../types/Company')
const Company = require('../../models/Company')
const validateUpdateInput = require('../../validation/updateCompany')

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
 * @param {String} handle
 * @param {Object} company
 */
const updateHandle = function(handle, company) {
  return new Promise(function(resolve, reject) {
    if (handle) {
      Company.findOne({ handle }).then(function(existingCompany) {
        if (existingCompany) {
          errors.handle = 'Company already exists'
          reject({ errors })
        } else {
          company.handle = handle
          resolve(company)
        }
      })
    } else {
      resolve(company)
    }
  })
}

/**
 * @param {String} email
 * @param {Object} company
 */
const updateEmail = function(email, company) {
  return new Promise((resolve, reject) => {
    if (email) {
      Company.findOne({ email }).then(existingCompany => {
        if (existingCompany) {
          errors.email = 'Company already exists'
          reject({ errors })
        } else {
          company.email = email
          resolve(company)
        }
      })
    } else {
      resolve(company)
    }
  })
}

/**
 * @param {String} name
 * @param {Object} company
 */
const updateName = function(name, company) {
  return new Promise((resolve, reject) => {
    if (name) {
      Company.findOne({ name }).then(existingCompany => {
        if (existingCompany) {
          errors.name = 'Company already exists'
          reject({ errors })
        } else {
          company.name = name
          resolve(company)
        }
      })
    } else {
      resolve(company)
    }
  })
}

const updateCompany = {
  type: CompanyType,
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    name: {
      type: GraphQLString,
    },
    handle: {
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
    const { id, handle, intro, name, email } = args

    return new Promise(function(res, rej) {
      authCompany(request, response, errors)
        .then(() => {
          if (!isValid) {
            rej({ errors })
          }

          findCompany(id, errors)
            .then(function(company) {
              return updateHandle(handle, company)
            })
            .then(function(company) {
              return updateEmail(email, company)
            })
            .then(function(company) {
              return updateName(name, company)
            })
            .then(function(company) {
              if (intro) company.intro = intro

              return company.save()
            })
            .then(function(company) {
              res(company)
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

module.exports = updateCompany
