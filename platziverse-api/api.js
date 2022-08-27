'use strict'

const debug = require('debug')('platziverse:api:routes')
const express = require('express')
const db = require('platziverse-db')
const {expressjwt: auth} = require('express-jwt')
const { handleFatalError, configuration } = require('platziverse-utils')
const config = configuration(false, 'postgres', s => debug(s))
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

api.get('/agents',auth(config.auth) , async (req, res, next) => {
  debug('A request has come to Agents')

  let agents = []
  try {
    agents = await Agent.findConnected()
  } catch (error) {
    next(error)
  }
  res.json(agents)
})

api.get('/agent/:uuid', async (req, res, next) => {
  const { uuid } = req.params
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

api.get('/metrics/:uuid', async (req, res, next) => {
  const { uuid } = req.params

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

api.get('/metrics/:uuid/:type', async (req, res, next) => {
  const { uuid, type } = req.params

  debug(`request to metrics/${uuid}/${type}`)
  let metrics = []
  try {
    metrics = await Metric.findByTypeAgentUuid(uuid, type)
  } catch (error) {
    next(error)
  }

  if (!metrics || metrics.length === 0) {
    return next(new Error(`Metrics not found for agent with uuid  ${uuid} and type ${type}`))
  }

  res.json(metrics)
})

module.exports = api
