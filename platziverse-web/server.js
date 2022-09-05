'use strict'

const debug = require('debug')('platziverse:web')
const { handle } = require('platziverse-utils')
const { handleFatalError } = handle
const http = require('http')
const path = require('path')
const express = require('express')
const chalk = require('chalk')

const port = process.env.PORT || 8080
const app = express()
const server = http.createServer(app)

app.use(express.static(path.join(__dirname, 'public')))


process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)

server.listen(port, () => {
  console.log(`${chalk.green('[platziverse-web]')} Server listening on port ${port}`)
})
