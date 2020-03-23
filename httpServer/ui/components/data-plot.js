// eslint-disable-next-line no-unused-vars
import { Line } from 'react-chartjs-2';
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
                    fill: false,
                },
            ],
        };

        const chartOptions = {
            layout: { padding: { top: 0, bottom: 0, left: 0, right: 0 } },
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    ticks: { beginAtZero: true, display: true },
                }],
                xAxes: [{
                    ticks: { beginAtZero: false, display: true },
                }],
            },
            legend: { display: false },
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
                <Line data={chartData} width='100%' height='200' options={chartOptions} />
            </div>
        );
    }
}
