'use strict'

const debug = require('debug')('platziverse:web')
const { handle, utils } = require('platziverse-utils')
const { handleFatalError } = handle
const { pipe } = utils
const http = require('http')
const path = require('path')
const express = require('express')
const socketio = require('socket.io')
const chalk = require('chalk')
const PlatziverseAgent = require('platziverse-agent')

const port = process.env.PORT || 8080
const app = express()
const server = http.createServer(app)

const io = socketio(server)

const agent = new PlatziverseAgent()
const proxy = require('./proxy')

app.use(express.static(path.join(__dirname, 'public')))
app.use('/', proxy)
// Socket.io / Websockets

io.on('connect', socket => {
  debug(`Connected ${socket.id}`)

  // agent.on('agent/disconnected', payload => {
  //   socket.emit('agent/disconnected', payload)
  // })

  pipe(agent, socket)
})

/** Express error handler */

app.use((err, req, res, next) => {
  debug(`Error: ${err.message}`)

  if (err.message.match(/not found/)) {
    return res.status(404).send({ error: err.message })
  }

  res.status(500).send({ error: err.message })
})

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)

server.listen(port, () => {
  agent.connect()
  console.log(`${chalk.green('[platziverse-web]')} Server listening on port ${port}`)
})
