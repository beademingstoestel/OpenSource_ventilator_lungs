// eslint-disable-next-line no-unused-vars
import { Scatter } from 'react-chartjs-2';
import React from 'react';
import { isArray } from 'util';

export default class DataPlot extends React.Component {

    colors = [
        '#ff6600',
        '#003399',
    ];

    render() {
        const title = this.props.title;

        const chartData = {
            datasets: [],
        };

        if (this.props.data.length > 0) {
            if (this.props.multipleDatasets) {

                for (let i = 0; i < this.props.data.length; i++) {
                    chartData.datasets.push({
                        label: 'dataset' + i,
                        borderColor: this.colors[i],
                        borderWidth: 2,
                        borderJoinStyle: 'round',
                        pointRadius: 0,
                        pointBorderWidth: 1,
                        lineTension: 0,
                        data: this.props.data[i],
                        showLine: true,
                        fill: false,
                        hiddenLegend: true,
                    });
                }
            } else {
                chartData.datasets.push({
                    label: 'dataset',
                    borderColor: '#ff6600',
                    borderWidth: 2,
                    borderJoinStyle: 'round',
                    pointRadius: 0,
                    pointBorderWidth: 1,
                    lineTension: 0,
                    data: this.props.data,
                    showLine: true,
                    fill: false,
                    hiddenLegend: true,
                });
            }
        }

        if (this.props.peak) {
            chartData.datasets.push({
                label: 'set value',
                borderColor: '#1cc88a',
                borderDash: [10, 5],
                borderWidth: 2,
                borderJoinStyle: 'round',
                pointRadius: 0,
                pointBorderWidth: 1,
                lineTension: 0,
                data: [{ x: 0, y: this.props.peak }, { x: this.props.timeScale, y: this.props.peak }],
                showLine: true,
                fill: false,
            });
        }

        if (this.props.threshold) {
            const upperThreshold = parseInt(this.props.peak) + parseInt(this.props.threshold);
            const lowerThreshold = parseInt(this.props.peak) - parseInt(this.props.threshold);

            chartData.datasets.push({
                label: 'upper threshold',
                borderColor: '#f6c23e',
                borderDash: [5, 5],
                borderWidth: 2,
                borderJoinStyle: 'round',
                pointRadius: 0,
                pointBorderWidth: 1,
                lineTension: 0,
                data: [{ x: 0, y: upperThreshold }, { x: this.props.timeScale, y: upperThreshold }],
                showLine: true,
                fill: false,
            });

            chartData.datasets.push({
                label: 'lower threshold',
                borderColor: '#f6c23e',
                borderDash: [5, 5],
                borderWidth: 2,
                borderJoinStyle: 'round',
                pointRadius: 0,
                pointBorderWidth: 1,
                lineTension: 0,
                data: [{ x: 0, y: lowerThreshold }, { x: this.props.timeScale, y: lowerThreshold }],
                showLine: true,
                fill: false,
            });
        }

        const chartOptions = {
            layout: { padding: { top: 0, bottom: 0, left: 0, right: 0 } },
            maintainAspectRatio: false,
            animation: false,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        display: true,
                        suggestedMin: this.props.minY,
                        suggestedMax: this.props.maxY,
                    },
                }],
                xAxes: [{
                    ticks: {
                        beginAtZero: false,
                        display: true,
                        suggestedMin: 0,
                        suggestedMax: this.props.timeScale,
                    },
                }],
            },
            legend: {
                display: this.props.peak | this.props.threshold,
                position: 'bottom',
                onClick: () => { }, // Disable hiding of the data when clicking on it.
                labels: {
                    filter: (legendItem, chartData) => {
                        return !legendItem.text.includes('dataset');
                    },
                },
            },
            tooltips: {
                enabled: false,
            },
            title: {
                display: true,
                position: 'left',
                text: title,
                padding: 10,
                lineHeight: 1,
                fontSize: 20,
                fontColor: '#677',
            },
        };

        return (
            <div style={{ height: '280px' }}>
                <Scatter data={chartData} options={chartOptions} />
            </div>
        );
    }
}
