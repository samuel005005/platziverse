'use strict'

const http = require('http')
const chalk = require('chalk')
const express = require('express')
const debug = require('debug')('platziverse:api:server')

const { handleFatalError } = require('platziverse-utils')

const api = require('./api')

const port = process.env.PORT || '3000'
const app = express()
const server = http.createServer(app)

app.use('/api', api)

/** Express error handler */
app.use((error, req, res, next) => {
  debug(`Error ${error.message}`)

  if (error.message.match(/not found/)) {
    return res.status(404).send({ error: error.message })
  }
  
  if (error.message.match(/No authorization/)) {
    return res.status(401).send({ error: error.message })
  }

  res.status(500).send({ error: error.message })
})

if (require.main === module) {
  process.on('uncaughtException', handleFatalError)
  process.on('unhandledRejection', handleFatalError)

  server.listen(port, () => {
    console.log(`${chalk.green('[platziverse-api]')} server listening on port ${port}`)
  })
}

module.exports = server
