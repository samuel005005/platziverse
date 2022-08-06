'use strict'

const agent = {
  id: 1,
  uuid: 'yyy-yyy-yyy',
  name: 'fixture',
  username: 'platzi',
  hostname: 'test-host',
  pid: 0,
  connected: true,
  createAt: new Date(),
  updatedAt: new Date()
}

const agents = [
  agent,
  extend(agent, { id: 2, uuid: 'yyy-yyy-yyy2', name: 'fixture 2', username: 'platzi', connected: false }),
  extend(agent, { id: 3, uuid: 'yyy-yyy-yyy3' }),
  extend(agent, { id: 4, uuid: 'yyy-yyy-yyy4', username: 'test' })
]

function extend (obj, values) {
  const clone = Object.assign({}, obj)
  return Object.assign(clone, values)
}
module.exports = {
  single: agent,
  all: agents,
  connected: agents.filter(a => a.connected === true),
  byUsername: username => agents.filter(a => a.username === username),
  byUuid: id => agents.filter(a => a.uuid === id).shift(),
  byId: id => agents.filter(a => a.id === id).shift()
}
