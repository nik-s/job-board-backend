/**
 * TODO:
 *
 * https://levelup.gitconnected.com/building-your-graphql-api-with-node-and-mongodb-799a2b9ae0b4
 * https://stackoverflow.com/questions/51336641/email-verification-using-nodejs
 * https://blog.logrocket.com/writing-end-to-end-tests-for-graphql-servers-using-jest/
 */

require('dotenv').config()

const express = require('express')
const app = express()
const mongoose = require('mongoose')
const passport = require('passport')
const db = process.env.MONGO_URI
const cors = require('cors')
const graphqlHTTP = require('express-graphql')
const schema = require('./schema/schema')

require('./auth/passport')(passport)

mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch(err => console.log(err))

// REVIEW
if (process.env.NODE_ENV === 'development') {
  app.use(cors())
}

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: true,
  })
)

app.use(passport.initialize())

const port = process.env.PORT || 5000

app.listen(port, () => console.log(`Server is running on port ${port}`))
