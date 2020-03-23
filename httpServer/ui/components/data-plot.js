// eslint-disable-next-line no-unused-vars
import { Scatter } from 'react-chartjs-2';
import React from 'react';

export default class DataPlot extends React.Component {

    render() {
        const title = this.props.title;

        const chartData =
        {
            datasets: [
                {
                    borderColor: 'rgba(68, 204, 153, 0.9)',
                    borderWidth: 2,
                    borderJoinStyle: 'round',
                    pointRadius: 5,
                    pointBorderColor: '#fff',
                    pointBackgroundColor: 'rgba(68, 204, 153, 0.9)',
                    pointBorderWidth: 3,
                    lineTension: 0,
                    data: this.props.data,
                    showLine: true,
                    fill: false,
                },
            ],
        };

        const chartOptions = {
            layout: { padding: { top: 0, bottom: 0, left: 0, right: 0 } },
            maintainAspectRatio: false,
            animation: false,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        display: true,
                        suggestedMin: 0,
                        suggestedMax: 100,
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
                padding: 0,
                lineHeight: 1,
                fontSize: 20,
                fontColor: '#677',
            },
        };

        return (
            <div className="position-relative h-50 w-100 d-flex align-items-center border-bottom border-gray">
                <Scatter data={chartData} width='100%' height='200' options={chartOptions} />
            </div>
        );
    }
}
