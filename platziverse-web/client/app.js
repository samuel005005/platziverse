'use strict'

import { createApp } from 'vue';
import App from './app.vue'
import Test from './components/test.vue'
// import Metric from './metric.vue'

// Vue.component('agent', Agent)
// Vue.component('metric', Metric)

// eslint-disable-next-line no-unused-vars
const app = createApp(App)
app.component('test', Test)
// app.component('metric', Metric)
app.mount('#app');