const passport = require('passport')

const authCompany = (req, res, errors) =>
  new Promise((resolve, reject) => {
    passport.authenticate('jwt-company', { session: false }, (err, company) => {
      if (err) {
        errors.auth = err.message
        reject({ errors })
      }
      if (company) {
        resolve(company)
      } else {
        errors.auth = 'Unauthorized'
        reject({ errors })
      }
    })(req, res)
  })

module.exports = authCompany
