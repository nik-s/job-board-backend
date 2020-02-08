require('dotenv').config()

const mongoose = require('mongoose')
const faker = require('faker')
const bcrypt = require('bcryptjs')
const User = require('./models/User')
const Company = require('./models/Company')
const Cv = require('./models/Cv')
const Job = require('./models/Job')
const db = process.env.MONGO_URI

const NUMBER_OF_USERS_OR_COMPANIES = 50

mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch(err => console.log(err))

function stringToSlug(str, separator) {
  str = str.trim()
  str = str.toLowerCase()

  // remove accents, swap ñ for n, etc
  const from = 'åàáãäâèéëêìíïîòóöôùúüûñç·/_,:;'
  const to = 'aaaaaaeeeeiiiioooouuuunc------'

  for (let i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i))
  }

  return str
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-') // collapse dashes
    .replace(/^-+/, '') // trim - from start of text
    .replace(/-+$/, '') // trim - from end of text
    .replace(/-/g, separator)
}

let i = 0

if (i === NUMBER_OF_USERS_OR_COMPANIES) {
  process.exit()
}

while (i <= NUMBER_OF_USERS_OR_COMPANIES) {
  i++

  const createUsersAndCvs = function() {
    const firstName = faker.name.firstName()
    const lastName = faker.name.lastName()
    const handle = faker.internet.userName()
    const intro = faker.name.jobTitle()
    const email = faker.internet.email()
    const password = faker.internet.password()
    bcrypt.genSalt(10, (_err, salt) => {
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) throw err
        const newUser = new User({
          handle: stringToSlug(handle, '-'),
          email,
          firstName,
          lastName,
          intro,
          password: hash,
        })
        newUser
          .save()
          .then(user => {
            console.log('Creating CVs for user: ', user.handle)
            const numOfCvs = Math.random() * (4 - 1) + 1
            let i = 0
            while (i <= numOfCvs) {
              i++
              const createRandomTextArr = function() {
                const numOfItemsInArr = Math.random() * (7 - 3) + 3
                let randomTextArr = []
                j = 0
                while (j <= numOfItemsInArr) {
                  j++
                  const text = faker.lorem.sentences(2)
                  randomTextArr.push(text)
                }
                return randomTextArr
              }
              const NewCv = new Cv({
                experience: createRandomTextArr(),
                education: createRandomTextArr(),
                userId: user.id,
              })

              NewCv.save().catch(err => console.log(err))
            }
          })
          .catch(err => console.log(err))
      })
    })
  }

  const createCompaniesAndJobs = function() {
    const name = faker.company.companyName()
    const handle = stringToSlug(name, '-')
    const intro = faker.company.catchPhrase()
    const email = `info@${handle}.com`
    const password = faker.internet.password()
    bcrypt.genSalt(10, (_err, salt) => {
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) throw err
        const newCompany = new Company({
          handle,
          email,
          name,
          intro,
          password: hash,
        })
        newCompany
          .save()
          .then(company => {
            console.log('Creating jobs for company: ', company.handle)
            const numOfJobs = Math.random() * (9 - 1) + 1
            let i = 0
            while (i <= numOfJobs) {
              i++
              const title = faker.name.jobTitle()
              const description = faker.lorem.paragraphs(4)
              const NewJob = new Job({
                title,
                description,
                companyId: company.id,
              })

              NewJob.save().catch(err => console.log(err))
            }
          })
          .catch(err => console.log(err))
      })
    })
  }

  createUsersAndCvs()
  createCompaniesAndJobs()
}
