'use strict'

const debug = require('debug')('platziverse:web')
const { handle } = require('platziverse-utils')
const { handleFatalError } = handle
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
  // socket.on('agent/message', payload => {
  //   console.log(payload)
  // })

  // setInterval(() => {
  //   socket.emit('agent/message', { agent: 'xxx-yyy'})
  // }, 2000)

  agent.on('agent/message', payload => {
      socket.emit('agent/message', payload)
  })

  agent.on('agent/connected', payload => {
    socket.emit('agent/connected', payload)
  })
  
  agent.on('agent/disconnected', payload => {
    socket.emit('agent/disconnected', payload)
  })

})


process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)

server.listen(port, () => {
  agent.connect()
  console.log(`${chalk.green('[platziverse-web]')} Server listening on port ${port}`)
})
