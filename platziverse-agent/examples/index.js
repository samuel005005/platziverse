'use strict'

const PlatziverseAgent = require('../')

const agent = new PlatziverseAgent({
  interval: 2000,
  name: 'myapp',
  username: 'admin'
})


agent.addMetric('rss', function getRss () {
  return process.memoryUsage().rss
})

agent.addMetric('getRandomPromise', function getRandomPromise () {
  return Promise.resolve(Math.random())
})

agent.addMetric('callbackMetric', function getRandomCallback (callback) {
  setTimeout(() => {
    callback(null, Math.random())
  }, 1000)
})

agent.connect()

 // This agent only
 agent.on('connected', handle)
 agent.on('disconnected', handle)
 agent.on('message', handle)

 // Other agent sending me (this not me , broadcast)
 agent.on('agent/connect', handle)
 agent.on('agent/disconnected', handle)
 agent.on('agent/message', handle)

 function handle( payload ){
    console.log(payload)
 }

 setTimeout(() => agent.disconnect(), 10000)