<template>
    <div class="metric">
        <h3 class="metric-type">{{ type }}</h3>
        <LineChart />
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
import { serverHost } from '../../config';


export default {
    data() {
        return {
            datacollection: {},
            error: null,
            color: null
        }
    },
    props: ['uuid', 'type', 'socket'],
    mounted() {
        this.initialize();
    },
    methods: {
        async initialize() {
            const { uuid, type } = this
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
        }
    }
}
</script> 
 
