// eslint-disable-next-line no-unused-vars
import { Scatter } from 'react-chartjs-2';
import React from 'react';
import { isArray } from 'util';

export default class DataPlot extends React.Component {

    convertHex(hex, opacity) {
        hex = hex.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        const result = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity + ')';
        return result;
    }

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
                        borderColor: this.props.data[i].color,
                        borderWidth: 2,
                        borderJoinStyle: 'round',
                        pointRadius: 0,
                        pointBorderWidth: 1,
                        lineTension: 0,
                        data: this.props.data[i].data,
                        showLine: true,
                        fill: this.props.data[i].fill,
                        backgroundColor: this.convertHex(this.props.data[i].color, 0.3),
                        hiddenLegend: true,
                    });
                }
            } else {
                chartData.datasets.push({
                    label: 'dataset',
                    borderColor: this.props.data.color,
                    borderWidth: 2,
                    borderJoinStyle: 'round',
                    pointRadius: 0,
                    pointBorderWidth: 1,
                    lineTension: 0,
                    data: this.props.data.data,
                    showLine: true,
                    fill: false,
                    hiddenLegend: true,
                });
            }
        }

        if (this.props.peak) {
            // when setting the peaks to ridiculous values (for example no volume control) don't show it on the graph
            if (this.props.peak < this.props.maxY * 4) {
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
        }

        if (this.props.breathingCycleStart) {
            chartData.datasets.push({
                label: 'breathing cycle start',
                borderColor: '#000',
                borderWidth: 1,
                borderJoinStyle: 'round',
                pointRadius: 0,
                pointBorderWidth: 1,
                lineTension: 0,
                data: [{ x: this.props.breathingCycleStart, y: this.props.minY + 1 }, { x: this.props.breathingCycleStart, y: this.props.maxY - 1 }],
                showLine: true,
                fill: false,
            });
        }

        if (this.props.breathingCycleEnd) {
            chartData.datasets.push({
                label: 'breathing cycle end',
                borderColor: '#000',
                borderWidth: 1,
                borderJoinStyle: 'round',
                pointRadius: 0,
                pointBorderWidth: 1,
                lineTension: 0,
                data: [{ x: this.props.breathingCycleEnd, y: this.props.minY + 1 }, { x: this.props.breathingCycleEnd, y: this.props.maxY - 1 }],
                showLine: true,
                fill: false,
            });
        }

        if (this.props.exhaleMoment) {
            chartData.datasets.push({
                label: 'exhale',
                borderColor: '#000',
                borderWidth: 1,
                borderJoinStyle: 'round',
                pointRadius: 0,
                pointBorderWidth: 1,
                lineTension: 0,
                data: [{ x: this.props.exhaleMoment, y: this.props.minY + 1 }, { x: this.props.exhaleMoment, y: this.props.maxY - 1 }],
                showLine: true,
                fill: false,
            });
        }

        if (this.props.threshold) {
            const upperThreshold = parseInt(this.props.peak) + parseInt(this.props.threshold);
            const lowerThreshold = parseInt(this.props.peak) - parseInt(this.props.threshold);

            if (upperThreshold < this.props.maxY * 4) {
                chartData.datasets.push({
                    label: 'upper threshold',
                    borderColor: '#e74a3b',
                    borderDash: [5, 5],
                    borderWidth: 3,
                    borderJoinStyle: 'round',
                    pointRadius: 0,
                    pointBorderWidth: 1,
                    lineTension: 0,
                    data: [{ x: 0, y: upperThreshold }, { x: this.props.timeScale, y: upperThreshold }],
                    showLine: true,
                    fill: false,
                });
            }

            chartData.datasets.push({
                label: 'lower threshold',
                borderColor: '#e74a3b',
                borderDash: [5, 5],
                borderWidth: 3,
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
                display: false,
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
