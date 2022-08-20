'use strict'

const debug = require('debug')('platziverse:api:routes')
const express = require('express')
const db = require('platziverse-db')

const { ResourceNotFoundError, handleFatalError, configDB } = require('platziverse-utils')

const api = express.Router()

let services , Agent, Metric

api.use('*', async (req, res, next) => {
  const config = configDB(false, 'postgres', s => debug(s))
  if(!services){
     debug(`Connecting to database`)
     try {
      services = await db(config).catch(handleFatalError)
     } catch (error) {
        return next(error)
     }
     Agent = services.Agent
     Metric = services.Metric
  }
  next()
})

api.get('/agents', (req, res) => {
  debug('A request has come to Agents')
  res.send({})
})
api.get('/agent/:uuid', (req, res, next) => {
  const { uuid } = req.params

  if (uuid !== 'yyy') {
    return next(new ResourceNotFoundError('Agent', { uuid }))
  }
  res.send({ uuid })
})

api.get('/metrics/:uuid', (req, res) => {
  const { uuid } = req.params

  res.send({ uuid })
})

api.get('/metrics/:uuid/:type', (req, res) => {
  const { uuid, type } = req.params

  res.send({ uuid, type })
})

module.exports = api
