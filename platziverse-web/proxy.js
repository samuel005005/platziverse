'use strict'

const express = require('express')
const axios = require('axios').default;
const { endpoint, apiToken } = require('./config')

const api = express.Router()

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
    } catch (error) {
        return next(error)
    }

    res.send(result)
})