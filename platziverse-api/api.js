'use strict'

const debug = require('debug')('platziverse:api:routes')
const express = require('express')
const db = require('platziverse-db')
const { handle, configuration } = require('platziverse-utils')
const { handleFatalError } = handle
const { expressjwt: auth } = require('express-jwt')
const config = configuration(false, 'postgres', s => debug(s))
const guard = require('express-jwt-permissions')(config.auth)

const api = express.Router()

let services, Agent, Metric

api.use('*', async (req, res, next) => {
  if (!services) {
    debug('Connecting to database')
    try {
      services = await db(config.db).catch(handleFatalError)
    } catch (error) {
      return next(error)
    }
    Agent = services.Agent
    Metric = services.Metric
  }
  next()
})

api.get('/agents', auth(config.auth), guard.check(['agent:read']), async (req, res, next) => {
  debug('A request has come to Agents')

  const { auth } = req

  if (!auth || !auth.username) {
    return next(new Error('No authorization'))
  }

  let agents = []
  try {
 
    if (auth.admin) {
      agents = await Agent.findConnected()
    } else {
      agents = await Agent.findByUsername(auth.username)
    }
  } catch (error) {
    return next(error)
  }

  res.json(agents)
})

api.get('/agent/:uuid', auth(config.auth), guard.check(['agent:read']) , async (req, res, next) => {

  const { auth, params } = req

  if (!auth || !auth.username) {
    return next(new Error('No authorization'))
  }

  const { uuid } = params

  let agent
  try {
    agent = await Agent.findByUuid(uuid)
  } catch (error) {
    next(error)
  }

  if (!agent) {
    return next(new Error(`Agent not found with uuid ${uuid}`))
  }

  res.json(agent)
})

api.get('/metrics/:uuid', auth(config.auth), guard.check(['metrics:read']), async (req, res, next) => {
  const { auth, params } = req

  if (!auth || !auth.username) {
    return next(new Error('No authorization'))
  }

  const { uuid } = params

  debug(`request to metrics/${uuid}`)
  let metrics = []
  try {
    metrics = await Metric.findByAgentUuid(uuid)
  } catch (error) {
    next(error)
  }

  if (!metrics || metrics.lenght === 0) {
    return next(new Error(`Metrics not found for agent with uuid ${uuid}`))
  }

  res.json(metrics)
})

api.get('/metrics/:type/:uuid', auth(config.auth), guard.check(['metrics:read']), async (req, res, next) => {
  const { auth, params } = req

  if (!auth || !auth.username) {
    return next(new Error('No authorization'))
  }

  const { uuid, type } = params

  debug(`request to metrics/${uuid}/${type}`)

  let metrics = []
  try {
    console.log(type)
    metrics = await Metric.findByTypeAgentUuid(type, uuid)
  } catch (error) {
    next(error)
  }

  if (!metrics || metrics.length === 0) {
    return next(new Error(`Metrics not found for agent with uuid  ${uuid} and type ${type}`))
  }

  res.json(metrics)
})

module.exports = api
