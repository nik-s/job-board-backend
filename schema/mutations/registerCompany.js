const graphql = require('graphql')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Company = require('../../models/Company')
const validateRegisterInput = require('../../validation/registerCompany')

const CompanyType = require('../types/Company')

const { GraphQLString, GraphQLNonNull, GraphQLError } = graphql

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

      Company.findOne({ handle }).then(company => {
        if (company) {
          errors.handle = 'Company already exists'
          rej({ errors })
        } else {
          const newCompany = new Company({
            name,
            intro,
            handle,
            email,
            password,
          })

          bcrypt.genSalt(10, (_err, salt) => {
            bcrypt.hash(newCompany.password, salt, (err, hash) => {
              if (err) throw new GraphQLError(JSON.stringify(err))
              newCompany.password = hash
              newCompany
                .save()
                .then(company => {
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
                .catch(err => {
                  rej({ ...errors, error: err.message })
                })
            })
          })
        }
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
