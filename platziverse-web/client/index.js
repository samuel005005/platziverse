import { createApp } from 'vue';

import App from './components/App.vue';
import Agent from './components/Agent.vue';
import Metric from './components/Metric.vue';

const app = createApp(App)
app.component('Agent', Agent)
app.component('Metric', Metric)
app.mount('#app');