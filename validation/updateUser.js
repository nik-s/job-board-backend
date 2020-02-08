const Validator = require('validator')
const validText = require('./valid-text')

module.exports = function validateRegisterInput(data) {
  let errors = {}

  data.firstName = validText(data.firstName) ? data.firstName : ''
  data.lastName = validText(data.lastName) ? data.lastName : ''
  data.handle = validText(data.handle) ? data.handle : ''
  data.email = validText(data.email) ? data.email : ''

  if (
    !Validator.isEmpty(data.handle) &&
    !Validator.isLength(data.handle, { min: 2, max: 30 })
  ) {
    errors.handle = 'Handle must be between 2 and 30 characters'
  }

  if (!Validator.isEmpty(data.email) && !Validator.isEmail(data.email)) {
    errors.email = 'Email is invalid'
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}
