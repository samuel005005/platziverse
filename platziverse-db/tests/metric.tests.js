'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const config = {
  logging: function () {}
}

const { metricFixtures, agentFixtures } = require('./fixtures/')

let db = null; const uuid = 'yyy-yyy-yyy'

let AgentStub, MetricStub, sandbox

const newMetric = {
  type: 'ram',
  value: '50%'
}

const findOneArgs = {
  where: { uuid }
}

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()

  AgentStub = {
    hasMany: sandbox.spy(),
    findOne: sandbox.stub()
  }

  MetricStub = {
    belongsTo: sandbox.spy(),
    create: sandbox.stub()
  }

  // AgentModel findOne Stub
  AgentStub.findOne.withArgs(findOneArgs).returns(Promise.resolve(agentFixtures.byUuid(uuid)))

  // MetricModel create Stub
  MetricStub.create.withArgs(newMetric).returns(Promise.resolve({
    toJSON () { return newMetric }
  }))

  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })

  db = await setupDatabase(config)
})

test.afterEach(() => {
  sandbox && sinon.resetHistory()
})

test('Metric', t => {
  t.truthy(db.Metric, 'Metric service should exist')
})

test.serial('Metric#create', async t => {
  const metric = await db.Metric.create(uuid, newMetric)

  t.true(AgentStub.findOne.called, 'findOne should be called on model')
  t.true(AgentStub.findOne.calledOnce, 'findOne should be called once')
  t.true(AgentStub.findOne.calledWith(findOneArgs), 'findOne should be called with uuid args')

  t.true(MetricStub.create.called, 'create should be called on model')
  t.true(MetricStub.create.calledOnce, 'create should be called once')
  t.true(MetricStub.create.calledWith(newMetric), 'create  should be called with newMetric args')
  
  t.deepEqual(metric, newMetric, 'should be the same')
})
