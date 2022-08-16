'use strict'

const debug = require('debug')('platziverse:api:routes')
const express = require('express')

const api = express.Router()

api.get('/agents', ( req, res ) => {})
api.get('/agent/:uuid', ( req, res ) => {})
module.exports = api    