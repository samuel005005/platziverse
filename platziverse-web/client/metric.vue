<template>
  <div class="metric">
    <h3 class="metric-type">{{ type }}</h3>
    <line-chart :chart-data="datacollection" :options="{ responsive: true }" :width="400" :height="200"></line-chart>
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
import axios from 'axios';
import moment from 'moment';
import { getColor } from 'random-material-color';
import LineChart from './line-chart';
import { serverHost } from '../config';

export const name = 'metric';
export const components = {
  LineChart
};
export const props = ['uuid', 'type', 'socket'];
export function data() {
  return {
    datacollection: {},
    error: null,
    color: null
  };
}
export function mounted() {
  this.initialize();
}
export const methods = {
  async initialize() {

    const { uuid, type } = this;
    this.color = getColor();
    const options = {
      method: 'GET',
      url: `${serverHost}/metrics/${uuid}/${type}`,
      json: true
    };

    let result;

    try {
      result = await axios(options);
    } catch (e) {
      this.error = e.response.data.error;
      return;
    }

    const labels = [];
    const data = [];
    if (Array.isArray(result.data)) {
      result.data.forEach(m => {

        labels.push(moment(m.createdAt).format('HH:mm:ss'));
        data.push(m.value);
      });
    }

    this.datacollection = {
      labels,
      datasets: [{
        backgroundColor: this.color,
        label: type,
        data
      }]
    };

    this.startRealtime();
  },
  startRealtime() {
    const { uuid, type, socket } = this;
    socket.on('agent/message', payload => {

      if (payload.agent.uuid === uuid) {

        const metrics = payload.metrics.find(m => m.type === type);
        // Copy current values
        const labels = this.datacollection.labels;
        const data = this.datacollection.datasets[0].data;

        // Remove firt element if length > 20
        const length = labels.length || data.length;
        if (length >= 20) {
          labels.shift();
          data.shift();
        }
        // add new  element 
        labels.push(moment(metrics.createdAt).format('HH:mm:ss'));
        data.push(metrics.value);

        this.datacollection = {
          labels,
          datasets: [{
            backgroundColor: this.color,
            label: type,
            data
          }]
        };
      }
    });
  },
  handleError(err) {
    this.error = err.message;
  }
};
</script>
