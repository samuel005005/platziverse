'use strict'

const express = require('express')
const axios = require('axios').default;
const { endpoint, apiToken } = require('./config')

const api = express.Router()


api.get('/agent/:uuid', async (req, res, next) => {

    const { uuid } = req.params
    const options = {
        method: 'GET',
        url: `${endpoint}/api/agent/${uuid}`,
        headers: {
            'Authorization': `Bearer ${apiToken}`
        },
        json:true
    }

    let result

    try {
        result = await axios(options)
    } catch (e) {
        return next(new Error(e.response.data.error))
    }

    res.send(result.data)
})

api.get('/agents', async (req, res, next) => {
  
    const options = {
        method: 'GET',
        url: `${endpoint}/api/agents`,
        headers: {
            'Authorization': `Bearer ${apiToken}`
        },
        json:true
    }

    let result

    try {
        result = await axios(options)
    } catch (e) {
        return next(new Error(e.response.data.error))
    }

    res.send(result.data)
})

api.get('/metrics/:uuid', async (req, res, next) => {
    const { uuid } = req.params
    const options = {
        method: 'GET',
        url: `${endpoint}/api/metrics/${uuid}`,
        headers: {
            'Authorization': `Bearer ${apiToken}`
        },
        json:true
    }

    let result

    try {
        result = await axios(options)
    } catch (e) {
        return next(new Error(e.response.data.error))
    }
    res.send(result.data)    
})

api.get('/metrics/:type/:uuid', async (req, res, next) => {
    const { uuid, type } = req.params
    const options = {
        method: 'GET',
        url: `${endpoint}/api/metrics/${uuid}/${type}`,
        headers: {
            'Authorization': `Bearer ${apiToken}`
        },
        json:true
    }

    let result

    try {
        result = await axios(options)
    } catch (e) {
        return next(new Error(e.response.data.error))
    }
    res.send(result.data)    
})

module.exports = api