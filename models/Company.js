const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CompanySchema = new Schema({
  handle: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  intro: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
})

module.exports = Company = mongoose.model('Company', CompanySchema)
