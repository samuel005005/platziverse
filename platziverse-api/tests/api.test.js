'use strict'

const test = require('ava')
const request = require('supertest')

const server = require('../server')

test.serial('/api/agents', async t => {
  const { header, statusCode, error, body } = await request(server).get('/api/agents')
  t.regex(header['content-type'], /json/, 'response Content Type should be json type')
  t.deepEqual(statusCode, 200, 'response status code should be 200')
  t.falsy(error, 'should not return an error')
  t.deepEqual(body, {}, 'response body should be the expected')
})
