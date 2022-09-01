'use strict'

const test = require('ava')
const request = require('supertest')
const sinon = require('sinon')
const util = require('util')
const proxyquire = require('proxyquire')
const agentFixtures = require('./fixtures/agent')
const metricsFixtures = require('./fixtures/metric')
const { configuration } = require('platziverse-utils')
const debug = require('debug')
const config = configuration(false, 'postgres', s => debug(s))
const uuid = 'yyy-yyy-yyy'
const type = 'ram'
const auth = require('../auth')
const sign = util.promisify(auth.sign)

let server = null
let sandbox = null
let dbStub = null
const AgentStub = {}
const MetricStub = {}
let token = null

const agentbyUuid = agentFixtures.byUuid(uuid)
const findByAgentUuid =  metricsFixtures.findByAgentUuid(uuid)
const findByTypeAgentUuid = metricsFixtures.findByTypeAgentUuid(type, uuid)

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()

  /** AgentStub */

  //  findConnected
  AgentStub.findConnected = sandbox.stub()
  AgentStub.findConnected.withArgs().returns(Promise.resolve(agentFixtures.connected))

  // findByUuid
  AgentStub.findByUuid = sandbox.stub()
  AgentStub.findByUuid.withArgs(uuid).returns(Promise.resolve(agentbyUuid))

  /** MetricStub */
  MetricStub.findByAgentUuid = sandbox.stub()
  MetricStub.findByAgentUuid.withArgs(uuid).returns(Promise.resolve(findByAgentUuid))

  //findByTypeAgentUuid
  MetricStub.findByTypeAgentUuid = sandbox.stub()
  MetricStub.findByTypeAgentUuid.withArgs(type, uuid).returns(Promise.resolve(findByTypeAgentUuid))
  // DBStub
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

test.serial('/api/agents - not authorized', async t => {
  const { header, statusCode, error, body } = await request(server).get('/api/agents')
  t.regex(header['content-type'], /json/, 'response Content Type should be json type')
  t.deepEqual(statusCode, 401, 'response status code should be 401')
  t.truthy(error, 'should not return an error')
  t.deepEqual(JSON.stringify(body), '{"error":"No authorization token was found"}', 'response body should be the expected')
})

test.serial('/api/agent/:uuid', async t => {
  const { header, statusCode, error, body } = await request(server).get(`/api/agent/${uuid}`).set('Authorization', `Bearer ${token}`)

  t.regex(header['content-type'], /json/, 'response Content Type should be json type')
  t.deepEqual(statusCode, 200, 'response status code should be 200')
  t.falsy(error, 'should not return an error')
  t.deepEqual(JSON.stringify(body), JSON.stringify(agentbyUuid), 'response body should be the expected')
})

test.serial('/api/agent/:uuid -- not found', async t => {
  const { header, statusCode, error, body } = await request(server).get(`/api/agent/${uuid}2`).set('Authorization', `Bearer ${token}`)

  t.regex(header['content-type'], /json/, 'response Content Type should be json type')
  t.deepEqual(statusCode, 404, 'response status code should be 404')
  t.truthy(error, 'should not return an error')
  t.deepEqual(JSON.stringify(body), '{"error":"Agent not found with uuid yyy-yyy-yyy2"}', 'response body should be the expected')
})

test.serial('/api/agent/:uuid - not authorized', async t => {
  const { header, statusCode, error, body } = await request(server).get(`/api/agent/${uuid}`)
  t.regex(header['content-type'], /json/, 'response Content Type should be json type')
  t.deepEqual(statusCode, 401, 'response status code should be 401')
  t.truthy(error, 'should not return an error')
  t.deepEqual(JSON.stringify(body), '{"error":"No authorization token was found"}', 'response body should be the expected')
})

test.serial('/api/metrics/:uuid', async t => {
  const { header, statusCode, error, body } = await request(server).get(`/api/metrics/${uuid}`).set('Authorization', `Bearer ${token}`)

  t.regex(header['content-type'], /json/, 'response Content Type should be json type')
  t.deepEqual(statusCode, 200, 'response status code should be 200')
  t.falsy(error, 'should not return an error')
  t.deepEqual(JSON.stringify(body), JSON.stringify(findByAgentUuid), 'response body should be the expected')
})

test.serial('/api/metrics/:uuid -- not found', async t => {
  const { header, statusCode, error, body } = await request(server).get(`/api/metrics/${uuid}2`).set('Authorization', `Bearer ${token}`)

  t.regex(header['content-type'], /json/, 'response Content Type should be json type')
  t.deepEqual(statusCode, 404, 'response status code should be 404')
  t.truthy(error, 'should not return an error')
  t.deepEqual(JSON.stringify(body), '{"error":"Metrics not found for agent with uuid yyy-yyy-yyy2"}', 'response body should be the expected')
})

test.serial('/api/metrics/:uuid - not authorized', async t => {
  const { header, statusCode, error, body } = await request(server).get(`/api/metrics/${uuid}`)
  t.regex(header['content-type'], /json/, 'response Content Type should be json type')
  t.deepEqual(statusCode, 401, 'response status code should be 401')
  t.truthy(error, 'should not return an error')
  t.deepEqual(JSON.stringify(body), '{"error":"No authorization token was found"}', 'response body should be the expected')
})



test.serial('/api/metrics/:type/:uuid', async t => {
  const { header, statusCode, error, body } = await request(server).get(`/api/metrics/${type}/${uuid}`).set('Authorization', `Bearer ${token}`)

  t.regex(header['content-type'], /json/, 'response Content Type should be json type')
  t.deepEqual(statusCode, 200, 'response status code should be 200')
  t.falsy(error, 'should not return an error')
  t.deepEqual(JSON.stringify(body), JSON.stringify(findByTypeAgentUuid), 'response body should be the expected')
})

test.serial('/api/metrics/:type/:uuid -- not found', async t => {
  const { header, statusCode, error, body } = await request(server).get(`/api/metrics/${type}2/${uuid}1`).set('Authorization', `Bearer ${token}`)

  t.regex(header['content-type'], /json/, 'response Content Type should be json type')
  t.deepEqual(statusCode, 404, 'response status code should be 404')
  t.truthy(error, 'should not return an error')
  t.deepEqual(JSON.stringify(body), '{"error":"Metrics not found for agent with uuid  yyy-yyy-yyy1 and type ram2"}', 'response body should be the expected')
})

test.serial('/api/metrics/:type/:uuid -- not authorized', async t => {
  const { header, statusCode, error, body } = await request(server).get(`/api/metrics/${type}/${uuid}`)

  t.regex(header['content-type'], /json/, 'response Content Type should be json type')
  t.deepEqual(statusCode, 401, 'response status code should be 401')
  t.truthy(error, 'should not return an error')
  t.deepEqual(JSON.stringify(body), '{"error":"No authorization token was found"}', 'response body should be the expected')
})