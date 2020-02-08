const passport = require('passport')

// Based on: https://stackoverflow.com/a/45379297
const authUser = (req, res) =>
  new Promise((resolve, reject) => {
    passport.authenticate('jwt-user', { session: false }, (err, user) => {
      if (err) reject(err)
      if (user) resolve(user)
      else reject({ message: 'Unauthorized' })
    })(req, res)
  })

module.exports = authUser
