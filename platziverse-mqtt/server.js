'use strict'

const debug = require('debug')('platziverse:mqtt:server')
const redis = require('redis')
const chalk = require('chalk')
const { handleFatalError, configDB } = require('platziverse-utils')

const aedes = require('aedes')()
const server = require('net').createServer(aedes.handle)

const db = require('platziverse-db')
const config = configDB(false, 'postgres', s => debug(s))

const backend = {
  type: 'redis',
  redis,
  return_buffers: true
}

const settings = {
  port: 1883,
  backend
}

let Agent, Metric

// emitted when a client connects to the broker
aedes.on('client', client => {
  debug(`CLIENT_CONNECTED : MQTT Client ${(client ? client.id : client)} connected to aedes broker ${aedes.id}`)
})

// emitted when a client disconnects from the broker
aedes.on('clientDisconnect', client => {
  debug(`CLIENT_DISCONNECTED : MQTT Client ${(client ? client.id : client)} disconnected from the aedes broker ${aedes.id}`)
})

// emitted when a client publishes a message packet on the topic
aedes.on('publish', (packet, client) => {
  if (client) {
    debug(`MESSAGE_PUBLISHED : MQTT Client ${(client ? client.id : 'AEDES BROKER_' + aedes.id)} has published message "${packet.payload}" on ${packet.topic} to aedes broker ${aedes.id}`)
  }
})

server.listen(settings.port, async () => {
  const services = await db(config).catch(handleFatalError)

  Agent = services.Agent
  Metric = services.Metric

  console.log(`${chalk.green('[platziverse-mqtt]')} server is running`)
})

server.on('error', handleFatalError)
process.on('uncaughtException', handleFatalError)
process.on('unhandleRejection', handleFatalError)
