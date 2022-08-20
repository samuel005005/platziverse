'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const config = {
  logging: function () {}
}

const MetricStub = {
  belongsTo: sinon.spy()
}

const AgentStub = {
  hasMany: sinon.spy()
}

// hooks
test.beforeEach(async () => {
  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })

  await setupDatabase(config)
})

test.serial('Setup', t => {
  t.true(AgentStub.hasMany.called, 'AgentModel.hasMany was execute')
  t.true(AgentStub.hasMany.calledWith(MetricStub), 'Argument should be the Model')
  t.true(MetricStub.belongsTo.called, 'MetricStub.belongsTo was execute')
  t.true(MetricStub.belongsTo.calledWith(AgentStub), 'Argument should be the Model')
})
