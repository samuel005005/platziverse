<template>
  <div>
    <!-- <agent uuid="15f17410-c634-45f2-bad6-654f167ba773" :socket="socket"></agent>
    <metric type="callbackMetric" uuid="15f17410-c634-45f2-bad6-654f167ba773" :socket="socket"></metric> -->
    <agent v-for="agent in agents" :uuid="agent.uuid" :key="agent.uuid" :socket="socket">
    </agent>
    <p v-if="error">{{error}}</p>
  </div>
</template>

<style>
body {
  font-family: Arial;
  background: #f8f8f8;
  margin: 0;
}
</style>

<script>
import axios from 'axios'
import io from 'socket.io-client'
const socket = io()
import { serverHost } from '../config'


export default function data() {
  return {
    agents: [],
    error: null,
    // socket
  }
}
export function mounted() {
  this.initialize()
}
export const methods = {
  async initialize() {
    const options = {
      method: 'GET',
      url: `${serverHost}/agents`,
      json: true
    }
    let result
    try {
      result = await axios(options)
    } catch (e) {
      this.error = e.response.data.error
      return
    }

    this.agents = result.data
    socket.on('agent/connected', payload => {
      const { uuid } = payload.agent
      const existing = this.agents.find(a => a.uuid === uuid)
      if (!existing) {
        this.agents.push(payload.agent)
      }
    })
  }
}
</script>
