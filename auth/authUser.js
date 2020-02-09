const passport = require('passport')

// Based on: https://stackoverflow.com/a/45379297
const authUser = (req, res, errors) =>
  new Promise((resolve, reject) => {
    passport.authenticate('jwt-user', { session: false }, (err, user) => {
      if (err) {
        errors.auth = err.message
        reject({ errors })
      }
      if (user) {
        resolve(user)
      } else {
        errors.auth = 'Unauthorized'
        reject({ errors })
      }
    })(req, res)
  })

module.exports = authUser
