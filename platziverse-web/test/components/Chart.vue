<template>
    <canvas ref="metrictsChart" width="500" height="300"></canvas>
</template>
  
<script>
import Chart from 'chart.js';

export default {

    data() {
        return {
            chart: null
        }
    },
    name: 'metrics-chart',
    props: ['datacollection', 'type'],

    mounted() {
        this.chart = new Chart(this.$refs.metrictsChart, {
            type: 'line',
            data: {
                labels: this.label,
                datasets: [
                    {
                        label: this.type,
                        data: this.data
                    }
                ]
            }
        });
    },
    async updated() {
        const { labels, datasets } = this.datacollection
        this.chart.data.labels = labels
        this.chart.data.datasets = [
            {
                backgroundColor: datasets[0].backgroundColor,
                label: this.type,
                data: Object.values(datasets[0].data)
            }
        ]
        await this.chart.update()
    }
}
</script>