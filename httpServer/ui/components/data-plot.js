import { Line } from 'react-chartjs-2';
import { useState } from 'react';

const DataPlot = props => {
    const title = props.title;

    const [plotData, setPlotData] = useState([]);

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
                data: plotData,
                fill: false,
            },
        ],
    };

    const chartOptions = {
        layout: { padding: { top: 0, bottom: 0, left: 0, right: 0 } },
        maintainAspectRatio: false,
        scales: {
            yAxes: [{
                ticks: { beginAtZero: false, display: true },
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
};

export default DataPlot;
