// eslint-disable-next-line no-unused-vars
import { Scatter } from 'react-chartjs-2';
import React from 'react';
import { isArray } from 'util';

export default class DataPlot extends React.Component {

    render() {
        const title = this.props.title;

        const chartData = {
            datasets: [],
        };

        if (this.props.data.length > 0) {
            if (this.props.multipleDatasets) {
                console.log("multiple: " + this.props.data.length);
                for (let i = 0; i < this.props.data; i++) {
                    chartData.datasets.push({
                        borderColor: '#ff6600',
                        borderWidth: 2,
                        borderJoinStyle: 'round',
                        pointRadius: 0,
                        pointBorderWidth: 1,
                        lineTension: 0,
                        data: this.props.data[i],
                        showLine: true,
                        fill: false,
                    });
                }
            } else {
                chartData.datasets.push({
                    borderColor: '#ff6600',
                    borderWidth: 2,
                    borderJoinStyle: 'round',
                    pointRadius: 0,
                    pointBorderWidth: 1,
                    lineTension: 0,
                    data: this.props.data,
                    showLine: true,
                    fill: false,
                });
            }
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
                        suggestedMin: -1 * this.props.timeScale,
                        suggestedMax: 0,
                    },
                }],
            },
            legend: { display: false },
            tooltips: {
                enabled: false,
            },
            title: {
                display: true,
                text: title,
                padding: 10,
                lineHeight: 1,
                fontSize: 20,
                fontColor: '#677',
            },
        };

        return (
            <div style={{ height: '300px' }}>
                <Scatter data={chartData} options={chartOptions} />
            </div>
        );
    }
}
