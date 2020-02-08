const graphql = require('graphql')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Company = require('../../models/Company')
const validateLoginInput = require('../../validation/login')

const CompanyType = require('../types/Company')

const { GraphQLString, GraphQLNonNull, GraphQLError } = graphql

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

      Company.findOne({ email }).then(company => {
        if (!company) {
          errors.email = 'This company does not exist'
          rej({ errors })
        }

        bcrypt.compare(password, company.password).then(isMatch => {
          if (isMatch) {
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
          } else {
            errors.password = 'Incorrect password'
            rej({ errors })
          }
        })
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
