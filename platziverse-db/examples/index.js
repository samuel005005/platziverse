'use strict'

const db = require('../')

async function run () {
    const config = {
        database: process.env.DB_NAME || 'platziverse',
        username: process.env.DB_USER || 'platzi',
        password: process.env.DB_PASS || 'swagga',
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres'
    }

    const { Agent, Metric } = await db(config).catch(handleFatalError)

    const agent = await Agent.createOrUpdate({
        uuid: 'yyy-yyy',
        name: 'Samuel',
        username: 'samuel005',
        hostname: 'test-host',
        pid: 20,
        connected: true
    }).catch(handleFatalError)

    console.log('--agent--')
    console.log(agent)

    const agents = await Agent.findAll()
    console.log('--agents--')
    console.log(agents)
}

function handleFatalError(err) {
    console.error(err.message)
    console.error(err.stack)
    process.exit(1)
}

run()