const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const mongoose = require('mongoose')
const User = mongoose.model('User')
const Company = mongoose.model('Company')

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_OR_KEY,
}

module.exports = passport => {
  passport.use(
    'jwt-user',
    new JwtStrategy(options, (jwt_payload, done) => {
      User.findById(jwt_payload.id)
        .then(user => {
          if (user.isAdmin) {
            return done(null, user)
          }
          if (user) {
            return done(null, user)
          }
          return done(null, false)
        })
        .catch(err => console.log(err))
    })
  )

  passport.use(
    'jwt-company',
    new JwtStrategy(options, (jwt_payload, done) => {
      User.findById(jwt_payload.id)
        .then(user => {
          if (user && user.isAdmin) {
            return done(null, user)
          } else {
            Company.findById(jwt_payload.id)
              .then(company => {
                if (company) {
                  return done(null, company)
                }
                return done(null, false)
              })
              .catch(err => console.log(err))
          }
        })
        .catch(err => console.log(err))
    })
  )
}
