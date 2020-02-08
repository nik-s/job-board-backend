const graphql = require('graphql')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const authCompany = require('../../auth/authCompany')
const { GraphQLString, GraphQLNonNull, GraphQLID, GraphQLError } = graphql
const CompanyType = require('../types/Company')
const Company = require('../../models/Company')
const validateUpdateInput = require('../../validation/updatePassword')

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
    return authCompany(request, response)
      .then(() => {
        const { errors, isValid } = validateUpdateInput(args)
        return new Promise((res, rej) => {
          if (!isValid) {
            rej({ errors })
          }

          const { id, password } = args

          Company.findById(id)
            .then(company => {
              bcrypt.genSalt(10, (_err, salt) => {
                bcrypt.hash(password, salt, (err, hash) => {
                  if (err) throw new GraphQLError(JSON.stringify(err))
                  company.password = hash
                  company.save().then(company => {
                    const payload = { id: company.id, handle: company.handle }

                    jwt.sign(
                      payload,
                      process.env.SECRET_OR_KEY,
                      { expiresIn: 3600 },
                      (_err, token) => {
                        res({
                          id: company.id,
                          name: company.firstName,
                          handle: company.handle,
                          email: company.email,
                          success: true,
                          token: 'Bearer ' + token,
                        })
                      }
                    )
                  })
                })
              })
            })
            .catch(err => {
              rej({ ...errors, error: err.message })
            })
        }).catch(err => {
          rej({ ...errors, error: err.message })
        })
      })
      .catch(err => {
        const keys = Object.keys(err.errors)
        keys.map(key => {
          throw new GraphQLError(errors[key])
        })
      })
  },
}

module.exports = updateCompanyPassword
