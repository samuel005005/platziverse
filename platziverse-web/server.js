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

app.use(express.static(path.join(__dirname, 'public')))

// Socket.io / Websockets

io.on('connect', socket => {
  debug(`Connected ${socket.id}`)

  // agent.on('agent/disconnected', payload => {
  //   socket.emit('agent/disconnected', payload)
  // })

  pipe(agent, socket)
})

/** Express error handler */
app.use((error, req, res, next) => {
  debug(`Error ${error.message}`)

  if (error.message.match(/not found/)) {
    return res.status(404).send({ error: error.message })
  }

  if (error.message.match(/No authorization/)) {
    return res.status(401).send({ error: error.message })
  }

  if (error.message.match(/Permission denied/)) {
    return res.status(403).send({ error: error.message })
  }

  res.status(500).send({ error: error.message })
})

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)

server.listen(port, () => {
  agent.connect()
  console.log(`${chalk.green('[platziverse-web]')} Server listening on port ${port}`)
})
