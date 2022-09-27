'use strict'

const debug = require('debug')('platziverse:agent')
const os = require('os')
const util = require('util')
const mqtt = require('mqtt')
const defaults = require('defaults')
const EventEmmiter = require('events')
const { utils } = require('platziverse-utils')
const { parsePayload } = utils
const uuid = require('uuid')

const options = {
  name: 'untitled',
  username: 'unnamed',
  interval: 5000,
  mqtt: {
    host: 'mqtt://localhost'
  }
}

class PlatziverseAgent extends EventEmmiter {
  constructor (opts) {
    super()
    this._options = defaults(opts, options)
    this._started = false
    this._timer = null
    this._client = null
    this._agentId = null
    this._metrics = new Map()
  }

  addMetric (type, func) {
    this._metrics.set(type, func)
  }

  removeMetric (type) {
    this._metrics.delete(type)
  }

  connect () {
    if (!this._started) {
      const opts = this._options

      this._client = mqtt.connect(opts.host)
      this._started = true
      this._client.subscribe('agent/message')
      this._client.subscribe('agent/connected')
      this._client.subscribe('agent/disconnected')

      this._client.on('connect', () => {
        this._agentId = uuid.v4()

        this.emit('connected', this._agentId)

        this._timer = setInterval(async () => {
          if (this._metrics.size > 0) {
            const message = {
              agent: {
                uuid: this._agentId,
                username: opts.username,
                name: opts.name,
                hostname: os.hostname() || 'localhost',
                pid: process.pid
              },
              metrics: [],
              timestamp: new Date().getTime()
            }

            for (let [metric, func] of this._metrics) {
              if (func.length === 1) {
                func = util.promisify(func)
              }

              message.metrics.push({
                type: metric,
                value: await Promise.resolve(func())
              })
            }

            debug('Sending', message)

            this._client.publish('agent/message', JSON.stringify(message))
            this.emit('message', message)
          }

        }, opts.interval)
      })

      this._client.on('message', (topic, payload) => {
        payload = parsePayload(payload)
        let broadcast = false
        switch (topic) {
          case 'agent/connected':
          case 'agent/disconnected':
          case 'agent/message':
            broadcast = payload && payload.agent && payload.agent.uuid !== this._agentId
            break
        }
        if (broadcast) {
          this.emit(topic, payload)
        }
      })

      this._client.on('error', () => this.disconnect())
    }
  }

  disconnect () {
    if (this._started) {
      clearInterval(this._timer)
      this._started = false
      this.emit('disconnected', this._agentId)
      this._client.end()
    }
  }
}

module.exports = PlatziverseAgent
