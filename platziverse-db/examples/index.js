'use strict'

const db = require('../')
const { configDB, handleFatalError } = require('platziverse-utils')

async function run () {
  const config = configDB(false, 'postgres', null)

  const { Agent, Metric } = await db(config).catch(handleFatalError)

  const agent = await Agent.createOrUpdate({
    uuid: 'yyy-yyy',
    name: 'Samuel',
    username: 'samuel005',
    hostname: 'test-host',
    pid: 20,
    connected: true
  }).catch(handleFatalError)

  console.log('--new --agent--')
  console.log(agent)

  const agents = await Agent.findAll()
  console.log('--all--agents--')
  console.log(agents)

  const metric = await Metric.create(agent.uuid, {
    type: 'memory',
    value: 300
  }).catch(handleFatalError)

  console.log('--new-metric--')
  console.log(metric)

  const metrics = await Metric.findByAgentUuid(agent.uuid).catch(handleFatalError)
  console.log('metrics--uuid-agents--')
  console.log(metrics)

  const metricsByType = await Metric.findByTypeAgentUuid('memory', agent.uuid).catch(handleFatalError)
  console.log('--metric--by--type--')
  console.log(metricsByType)
}

run()
