<template>
  <div class="metric">
    <h3 class="metric-type">{{ type }}</h3>
    <line-chart
      :chart-data="datacollection"
      :options="{ responsive: true }"
      :width="400" :height="200"
    ></line-chart>
    <p v-if="error">{{error}}</p>
  </div>
</template>
<style>
  .metric {
    border: 1px solid white;
    margin: 0 auto;
  }
  .metric-type {
    font-size: 28px;
    font-weight: normal;
    font-family: 'Roboto', sans-serif;
  }
  canvas {
    margin: 0 auto;
  }
</style>
<script>
const axios = require('axios').default;
const moment = require('moment')
const randomMaterialColor = require('random-material-color')
const LineChart = require('./line-chart')

module.exports = {
  name: 'metric',
  components: {
    LineChart
  },
  props: [ 'uuid', 'type' , 'socket'],

  data() {
    return {
      datacollection: {},
      error: null,
      color: null
    }
  },

  mounted() {
    this.initialize()
  },

  methods: {
   async initialize() {

      const { uuid, type } = this
      this.color = randomMaterialColor.getColor()
      const options = {
        method: 'GET',
        url : `http://localhost:8080/metrics/${uuid}/${type}`,
        json:true
      }

      let result

      try {
        result = await axios(options)
      } catch (e) {
        this.error = e.response.data.error
        return
      }
   
      const labels = []
      const data = []
      if( Array.isArray(result.data) ){
        result.data.forEach(m => {
          
          labels.push(moment(m.createdAt).format('HH:mm:ss'))
          data.push(m.value)
        })
      }
    
      this.datacollection = {
        labels,
        datasets: [{
          backgroundColor: this.color,
          label: type,
          data
        }]
      }

      this.startRealtime()
    },
    startRealtime(){
      const { uuid, type, socket } = this
      socket.on('agent/message', payload => {
   
        if(payload.agent.uuid === uuid) {

          const metrics =  payload.metrics.find( m => m.type === type)
          // Copy current values
          const labels = this.datacollection.labels
          const data = this.datacollection.datasets[0].data

          // Remove firt element if length > 20
          const length = labels.length || data.length
          if (length >= 20){
            labels.shift()
            data.shift()
          }
          // add new  element 
          labels.push (moment(metrics.createdAt).format('HH:mm:ss'))
          data.push(metrics.value)

          this.datacollection = {
            labels,
            datasets: [{
              backgroundColor: this.color,
              label: type,
              data
            }]
          }
        }
      })
    },
    handleError (err) {
      this.error = err.message
    }
  }
}
</script>
