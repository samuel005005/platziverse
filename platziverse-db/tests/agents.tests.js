'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const  agentFixtures = require('./fixtures/agent')

const config = {
  logging: function () {}
}

const MetricStub = {
  belongsTo: sinon.spy()
}

let single = Object.assign({}, agentFixtures.single)
let AgentStub = null
let db = null
let sandbox = null
let id = 1

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()

  AgentStub = {
    hasMany: sandbox.spy()
  }
  // // model findById Stub
  AgentStub.findById = sandbox.stub()
  AgentStub.findById.withArgs(id).returns( Promise.resolve(agentFixtures.byId(id)))

  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })

  db = await setupDatabase(config)
})

test.afterEach(() => {
  sandbox && sinon.resetHistory()
})

test('Agent', t => {
  t.truthy(db.Agent, 'Agent service should exist')
})

test.serial('Setup', t => {
  t.true(AgentStub.hasMany.called, 'AgentModel.hasMany was execute')
  t.true(AgentStub.hasMany.calledWith(MetricStub), 'Argument should be the Model')
  t.true(MetricStub.belongsTo.called, 'MetricStub.belongsTo was execute')
  t.true(MetricStub.belongsTo.calledWith(AgentStub), 'Argument should be the Model')
})

test.serial('Agent#findById', async t => {
  let agent = await db.Agent.findById(id)
  t.true(AgentStub.findById.called, 'findById should be called on model')
  t.true(AgentStub.findById.calledOnce,'findById should be called once')
  t.true(AgentStub.findById.calledWith(id),'findById should be called with specified id')

  t.deepEqual( agent , agentFixtures.byId(id), 'should be the same')
})
