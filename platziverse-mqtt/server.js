'use strict'

const debug = require('debug')('platziverse:mqtt:server')
const redis = require('redis')
const chalk = require('chalk')
const { handleFatalError, handleError, configDB, parsePayload } = require('platziverse-utils')

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

const clients = new Map() // The Map object stores key/value pairs. Any value (both value and primitive objects) can be used as a key or value.

let Agent, Metric

// emitted when a client connects to the broker
aedes.on('client', client => {
  debug(`Client Connected ${client.id}`)
  clients.set(client.id, null)
})

// emitted when a client disconnects from the broker
aedes.on('clientDisconnect', async client => {
  debug(`Client disconnected ${client.id}`)
  const agent = clients.get(client.id)
  if (agent) {
    agent.connected = false

    try {
      await Agent.createOrUpdate(agent)
    } catch (error) {
      return handleError(error)
    }
    // Delete Agent from clients List
    clients.delete(client.id)

    aedes.publish({
      topic: 'agent/disconnected',
      payload: JSON.stringify({
        uuid: agent.uuid
      })
    })

    debug(`Client ${client.id} associated to Agent ${agent.uuid} was marked as disconneted`)
  }
})

// emitted when a client publishes a message packet on the topic
aedes.on('publish', async (packet, client) => {
  debug(`Received: ${packet.topic}`)
  let payload

  switch (packet.topic) {
    case 'agent/connected':
    case 'agent/disconnected':
      debug(`Payload: ${packet.payload}`)
      break
    case 'agent/message':
      debug(`Payload: ${packet.payload}`)

      payload = parsePayload(packet.payload)
      
      if (payload) {
        payload.agent.connected = true

        let agent
        try {
          agent = await Agent.createOrUpdate(payload.agent)
        } catch (error) {
          return handleError(error)
        }

        debug(`Agent ${agent.uuid} saved`)

        // Notify Agent is Connected
        if (!clients.get(client.id)) {
          clients.set(client.id, agent)
          aedes.publish({
            topic: 'agent/connected',
            payload: JSON.stringify({
              agent: {
                uuid: agent.uuid,
                name: agent.name,
                hostname: agent.hostname,
                pid: agent.pid,
                connected: agent.connected
              }
            })
          })
        }

        /// Store Metrics
        await Promise.allSettled(payload.metrics
          .map(
            async (metric) =>
              Metric.create(agent.uuid, metric)
          )).then(response => {
          for (const res of response) {
            const { status, value } = res
            if (status === 'fulfilled') {
              debug(`Metric ${value.id} saved on agent ${agent.uuid}`)
            } else if (status === 'rejected') {
              handleError(value)
            }
          }
        })
      }
      break
    default:
      break
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
