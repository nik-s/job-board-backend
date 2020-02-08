const passport = require('passport')

const authCompany = (req, res) =>
  new Promise((resolve, reject) => {
    passport.authenticate('jwt-company', { session: false }, (err, company) => {
      if (err) reject(err)
      if (company) resolve(company)
      else reject({ message: 'Unauthorized' })
    })(req, res)
  })

module.exports = authCompany
