'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const config = {
  logging: function () {}
}
const { utils, fixtures } = require('platziverse-utils')
const { extend } = utils
const { metricFixtures, agentFixtures } = fixtures

let db = null; const uuid = 'yyy-yyy-yyy'; const type = 'ram'

let AgentStub, MetricStub, sandbox, findByAgentUuidArgs, findByTypeAgentUuidArgs

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
    create: sandbox.stub(),
    findAll: sandbox.stub()
  }

  const baseArgs = {
    include: [{
      attributes: [],
      model: AgentStub,
      where: {
        uuid
      }
    }],
    raw: true
  }

  findByAgentUuidArgs = extend({ attributes: ['type'], group: ['type'] }, baseArgs)
  findByTypeAgentUuidArgs = extend({
    attributes: ['id', 'type', 'value', 'createdAt'],
    where: {
      type
    },
    limit: 20,
    order: [['createdAt', 'DESC']]
  }, baseArgs)

  MetricStub.findAll.withArgs(findByAgentUuidArgs).returns(Promise.resolve(metricFixtures.findByAgentUuid(uuid)))
  MetricStub.findAll.withArgs(findByTypeAgentUuidArgs).returns(Promise.resolve(metricFixtures.findByTypeAgentUuid(type, uuid)))
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

test.serial('Metric#findByAgentUuid', async t => {
  const metrics = await db.Metric.findByAgentUuid(uuid)
  t.true(MetricStub.findAll.called, 'findAll should be called on model')
  t.true(MetricStub.findAll.calledOnce, 'findAll should be called once')
  t.true(MetricStub.findAll.calledWith(findByAgentUuidArgs), 'findAll should be called with findByAgentUuidArgs args')

  const metricsCompare = metricFixtures.findByAgentUuid(uuid)
  t.is(metrics.length, metricsCompare.length, 'metrics length should be same metricsCompare.length')
  t.deepEqual(metrics, metricsCompare, 'metrics should be same metricsCompare')
})

test.serial('Metric#findByTypeAgentUuid', async t => {
  const metrics = await db.Metric.findByTypeAgentUuid(type, uuid)

  t.true(MetricStub.findAll.called, 'findAll should be called on model')
  t.true(MetricStub.findAll.calledOnce, 'findAll should be called once')
  t.true(MetricStub.findAll.calledWith(findByTypeAgentUuidArgs), 'findAll should be called with findByTypeAgentUuidArgs args')

  const metricsCompare = metricFixtures.findByTypeAgentUuid(type, uuid)
  t.is(metrics.length, metricsCompare.length, 'metrics length should be same metricsCompare.length')
  t.deepEqual(metrics, metricsCompare, 'metrics should be same metricsCompare')
})
