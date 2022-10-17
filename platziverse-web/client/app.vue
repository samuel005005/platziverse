<template>
  <div>
    <agent uuid="15f17410-c634-45f2-bad6-654f167ba773" :socket="socket"></agent>
    <metric type="callbackMetric" uuid="15f17410-c634-45f2-bad6-654f167ba773" :socket="socket"></metric>
    <agent v-for="agent in agents" :uuid="agent.uuid" :key="agent.uuid">
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
const io = require('socket.io-client')
const socket = io()

module.exports = {
  data() {
    return {
      agents: [],
      error: null,
      socket
    }
  },

  mounted() {
    this.initialize()
  },

  methods: {
    initialize() {
    }
  }
}
</script>
