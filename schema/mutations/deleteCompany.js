const graphql = require('graphql')
const bcrypt = require('bcryptjs')
const { GraphQLString, GraphQLID, GraphQLNonNull, GraphQLError } = graphql
const Company = require('../../models/Company')
const validateLoginInput = require('../../validation/login')
const CompanyType = require('../types/Company')
const authCompany = require('../../auth/authCompany')

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

      return authCompany(request, response)
        .then(() => {
          Company.findOne({ email }).then(company => {
            if (!company) {
              errors.email = 'This company does not exist'
              rej({ errors })
            }

            bcrypt.compare(password, company.password).then(isMatch => {
              if (isMatch) {
                Company.deleteOne({ email }, err => {
                  if (err && err.message) throw new GraphQLError(err.message)
                  res({
                    success: true,
                  })
                })
              } else {
                errors.password = 'Incorrect password'
                rej({ errors })
              }
            })
          })
        })
        .catch(err => {
          rej({ ...errors, error: err.message })
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
