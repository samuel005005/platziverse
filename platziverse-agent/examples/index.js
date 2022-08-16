'use strict'

const PlatziverseAgent = require('../')

const agent = new PlatziverseAgent({
  interval: 2000,
  name: 'myapp',
  username: 'admin'
})

 // This agent only
 agent.on('connect', handle)
 agent.on('disconnect', handle)
 agent.on('message', handle)

 // Other agent sending me (this not me , broadcast)
 agent.on('agent/connect', handle)
 agent.on('agent/disconnect', handle)
 agent.on('agent/message', handle)

 function handle( payload ){
    console.log(payload)
 }

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
setTimeout(()=> agent.disconnect(), 10000)