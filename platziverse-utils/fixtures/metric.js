'use strict'

const agentData = require('./agent')
const { selectAttributes } = require('../utils')

const metric = {
  id: 1,
  agentId: 1,
  type: 'ram',
  value: 'fixture',
  createAt: new Date(),
  updatedAt: new Date()
}

const metrics = [
  metric,
  { ...metric, id: 2, agentId: 1, type: 'ram', value: '20GB' },
  { ...metric, id: 3, agentId: 2 },
  { ...metric, id: 4, agentId: 2, type: 'ram', value: '2GB' },
  { ...metric, id: 5, agentId: 2, type: 'disk' }
]

function findByAgentUuid (uuid) {
  const agent = agentData.byUuid(uuid)
  const results = metrics.filter(m => m.agentId === agent.id)
  return results.map(a => a.type)
}
function findByTypeAgentUuid (type, uuid) {
  const agent = agentData.byUuid(uuid)
  const results = metrics.filter(m => m.agentId === agent.id && m.type === type)
  return selectAttributes(results, ['id', 'type', 'value', 'createAt'])
}

module.exports = {
  findByAgentUuid,
  findByTypeAgentUuid
}
