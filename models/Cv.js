const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CvSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  experience: {
    type: [String],
  },
  education: {
    type: [String],
  },
  date: {
    type: Date,
    default: Date.now,
  },
})

module.exports = Cv = mongoose.model('Cv', CvSchema)
