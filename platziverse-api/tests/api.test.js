'use strict'

const test = require('ava')
const request = require('supertest')
const sinon = require('sinon')
const util = require('util')
const proxyquire = require('proxyquire')
const agentFixtures = require('./fixtures/agent')
const { configuration } = require('platziverse-utils')
const config = configuration(false, 'postgres', s => debug(s))
const uuid = 'yyy-yyy-yyy'
const auth = require('../auth')
const sign = util.promisify(auth.sign)

let server = null
let sandbox = null
let dbStub = null
const AgentStub = {}
const MetricStub = {}
let token = null

const agentbyUuid = agentFixtures.byUuid(uuid)

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()

  // AgentStub findConnected
  AgentStub.findConnected = sandbox.stub()
  AgentStub.findConnected.withArgs().returns(Promise.resolve(agentFixtures.connected))

  // AgentStub findByUuid
  AgentStub.findByUuid = sandbox.stub()
  AgentStub.findByUuid.withArgs(uuid).returns(Promise.resolve(agentbyUuid))

  dbStub = sandbox.stub()
  dbStub.returns(Promise.resolve({
    Agent: AgentStub,
    Metric: MetricStub
  }))

  token = await sign({ admin: true, username: 'platzi' }, config.auth.secret)

  const api = proxyquire('../api', {
    'platziverse-db': dbStub
  })

  server = proxyquire('../server', {
    './api': api
  })

})

test.afterEach(() => {
  sandbox && sinon.resetHistory()
})

test.serial('/api/agents', async t => {
  const { header, statusCode, error, body } = await request(server).get('/api/agents').set('Authorization', `Bearer ${token}`)

  t.regex(header['content-type'], /json/, 'response Content Type should be json type')
  t.deepEqual(statusCode, 200, 'response status code should be 200')
  t.falsy(error, 'should not return an error')
  t.deepEqual(JSON.stringify(body), JSON.stringify(agentFixtures.connected), 'response body should be the expected')
})

test.serial('/api/agent/:uuid', async t => {
  const { header, statusCode, error, body } = await request(server).get(`/api/agent/${uuid}`)

  t.regex(header['content-type'], /json/, 'response Content Type should be json type')
  t.deepEqual(statusCode, 200, 'response status code should be 200')
  t.falsy(error, 'should not return an error')
  t.deepEqual(JSON.stringify(body), JSON.stringify(agentbyUuid), 'response body should be the expected')
})

test.serial('/api/agent/:uuid -- no found', async t => {
  const { header, statusCode, error, body } = await request(server).get(`/api/agent/${uuid}`)

  t.regex(header['content-type'], /json/, 'response Content Type should be json type')
  t.deepEqual(statusCode, 200, 'response status code should be 200')
  t.falsy(error, 'should not return an error')
  t.deepEqual(JSON.stringify(body), JSON.stringify(agentbyUuid), 'response body should be the expected')
})
