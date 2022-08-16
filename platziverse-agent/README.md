# platziverse-agent

## Usage

```js
    const PlatziverseAgent = require('platziverse-agent')

    const agent = new PlatziverseAgent({
        interval:2000,
        name:'myapp',
        username: 'admin'
    })

  
    agent.connect()

    // This agent only
    agent.on('connect', handle)
    agent.on('disconnect', handle)
    agent.on('message', handle)

    // Other agent sending me (this not me , broadcast)
    agent.on('agent/connect')
    agent.on('agent/disconnect')
    agent.on('agent/message')


    agent.on('agent/message', payload => {
        console.log(payload)
    })

    setTimeout(()=> agent.disconnect(), 20000)

      agent.addMetric('rss', function getRss () {
        return process.memoryUsage().rss
    })

    agent.addMetric('rss', function getRandomPromise () {
        return Promise.resolve(Math.random())
    })

    agent.addMetric('callbackMetric', function getRandomCallback (callback) {
        setTimeout(() => {
          callback(null, Math.random())
        }, 1000)
    })

```