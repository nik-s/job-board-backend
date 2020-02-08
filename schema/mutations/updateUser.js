const graphql = require('graphql')
const authUser = require('../../auth/authUser')
const { GraphQLString, GraphQLNonNull, GraphQLID, GraphQLError } = graphql
const UserType = require('../types/User')
const User = require('../../models/User')
const validateUpdateInput = require('../../validation/updateUser')

const updateUser = {
  type: UserType,
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    handle: {
      type: GraphQLString,
    },
    firstName: {
      type: GraphQLString,
    },
    lastName: {
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
    return authUser(request, response)
      .then(() => {
        const { errors, isValid } = validateUpdateInput(args)
        return new Promise((res, rej) => {
          if (!isValid) {
            rej({ errors })
          }

          const { id, handle, firstName, lastName, intro, email } = args

          User.findById(id)
            .then(user => {
              let promises = []

              const updateHandle = new Promise(
                (handleResolve, handleReject) => {
                  User.findOne({ handle }).then(existingUser => {
                    if (existingUser) {
                      errors.handle = 'User already exists'
                      handleReject({ errors })
                    } else {
                      user.handle = handle
                      handleResolve()
                    }
                  })
                }
              )

              const updateEmail = new Promise((emailResolve, emailReject) => {
                User.findOne({ email }).then(existingUser => {
                  if (existingUser) {
                    errors.email = 'User already exists'
                    emailReject({ errors })
                  } else {
                    user.email = email
                    emailResolve()
                  }
                })
              })

              const updateFirstName = () => (user.firstName = firstName)
              const updateLastName = () => (user.lastName = lastName)
              const updateIntro = () => (user.intro = intro)

              if (handle) promises.push(updateHandle)
              if (email) promises.push(updateEmail)
              if (firstName) promises.push(updateFirstName)
              if (lastName) promises.push(updateLastName)
              if (intro) promises.push(updateIntro)

              Promise.all(promises)
                .then(() => {
                  user.save()
                  res(user)
                })
                .catch(err => {
                  console.log('TCL: resolve -> err', err)
                  rej({ errors })
                })
            })
            .catch(err => {
              console.log('TCL: resolve -> err 2', err)
              rej({ ...errors, error: err.message })
            })
        }) /*.catch(err => {
          rej({ ...errors, error: err.message })
        })*/
      })
      .catch(err => {
        const keys = Object.keys(err.errors)
        keys.map(key => {
          throw new GraphQLError(err.errors[key])
        })
      })
  },
}

module.exports = updateUser
