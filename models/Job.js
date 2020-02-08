const mongoose = require('mongoose')
const Schema = mongoose.Schema

const JobSchema = new Schema({
  companyId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
})

module.exports = Job = mongoose.model('Job', JobSchema)
