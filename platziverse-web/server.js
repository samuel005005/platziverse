'use strict'

import { handle, utils } from 'platziverse-utils'
import http from 'http'
import path from 'path'
import express from 'express'
import { Server } from 'socket.io'
import chalk from 'chalk'
import PlatziverseAgent from 'platziverse-agent'
import proxy from './proxy'

const debug = require('debug')('platziverse:web')
const { handleFatalError } = handle
const { pipe } = utils
const port = process.env.PORT || 8080


const app = express()
const server = http.createServer(app)

const io = new Server(server)
const agent = new PlatziverseAgent()


app.use(express.static(path.join(__dirname, 'public')))
app.use('/', proxy)
// Socket.io / Websockets

io.on('connect', socket => {
  debug(`Connected ${socket.id}`)

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
