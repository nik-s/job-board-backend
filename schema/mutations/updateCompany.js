const graphql = require('graphql')
const authCompany = require('../../auth/authCompany')
const { GraphQLString, GraphQLNonNull, GraphQLID, GraphQLError } = graphql
const CompanyType = require('../types/Company')
const Company = require('../../models/Company')
const validateUpdateInput = require('../../validation/updateCompany')

const updateCompany = {
  type: CompanyType,
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
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
    return authCompany(request, response)
      .then(() => {
        const { errors, isValid } = validateUpdateInput(args)
        return new Promise((res, rej) => {
          if (!isValid) {
            rej({ errors })
          }

          const { id, handle, intro, email } = args

          Company.findById(id)
            .then(company => {
              // TODO: mirar mutation `updateUser`
              if (handle) company.handle = handle
              if (intro) company.intro = intro
              if (email) company.email = email
              company.save()
              res(company)
            })
            .catch(err => {
              rej({ ...errors, error: err.message })
            })
        }) /*.catch(err => {
          rej({ ...errors, error: err.message })
        })*/
      })
      .catch(err => {
        const keys = Object.keys(err.errors)
        keys.map(key => {
          throw new GraphQLError(errors[key])
        })
      })
  },
}

module.exports = updateCompany
