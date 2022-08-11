'use strict'

const debug = require('debug')('platziverse:mqtt:server')
const redis = require('redis')
const chalk = require('chalk')

const aedes = require('aedes')()

const backend = {
    'type': 'redis',
     redis,
     return_buffers: true
}

const settings = {
    port:1883,
    backend
}

const server = require('net').createServer(aedes.handle)

server.listen(settings.port, function () {
  console.log(`${chalk.green('[platziverse-mqtt]')} server is running`)
})