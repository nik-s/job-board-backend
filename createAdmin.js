require('dotenv').config()

const argv = require('yargs').argv
const mongoose = require('mongoose')
const faker = require('faker')
const bcrypt = require('bcryptjs')
const User = require('./models/User')
const db = process.env.MONGO_URI

let password

if (argv.password) {
  password = argv.password
} else {
  console.log('A "--password" argument is required')
}

mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch(err => console.log(err))

bcrypt.genSalt(10, (_err, salt) => {
  bcrypt.hash(password, salt, (err, hash) => {
    const newAdmin = new User({
      // TEMP
      handle: 'admin',
      email: 'admin@example.com',
      firstName: 'Nik',
      lastName: 'Sytnik',
      intro: 'The Admin.',
      password: hash,
      isAdmin: true,
    })
    newAdmin
      .save()
      .then(() => {
        console.log('Created admin user')
        process.exit()
      })
      .catch(err => console.log(err))
  })
})
