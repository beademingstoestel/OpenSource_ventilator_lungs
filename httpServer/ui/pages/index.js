import MasterLayout from '../components/master-layout';
import { Client } from '@hapi/nes/lib/client';
import { useEffect, useState } from 'react';

import { Line } from 'react-chartjs-2';

let data = [];

function addData(chart, data) {
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
    });
    chart.update();
}

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

const Index = () => {
    const [pressureValue, setPressureValue] = useState([]);

    useEffect(() => {
        const client = new Client('ws://localhost:3001');
        const start = async () => {
            await client.connect();

            client.subscribe('/api/pressure_values', (update) => {
                console.log(update);
                let newData = update.map((value, timestamp) => [{ x: value, y: timestamp }]);
                data.concat(newData);

                addData(DataPlot, newData);
            });
        };

        start();
    });

    return (
        <MasterLayout>
            <div className="page-dashboard">
                <div className="page-dashboard__header">
                    Patient info

                    Normal intubated

                    Free field
                </div>

                <div className="page-dashboard__body">
                    <div className="page-dashboard__alert alert alert--danger">Trigger parameter has alert</div>

                    <div className="row u-mt-2">
                        <div className="col--lg-8">
                            <div className="row">
                                <div className="col--lg-8">
                                    <div>
                                        <input type="range" min="5" max="60" step="5" id="interval" />
                                        <label htmlFor="interval">Interval</label>
                                    </div>
                                </div>

                                <div className="col--lg-4">
                                    <div>
                                        <input type="checkbox" id="alarm" />
                                        <label htmlFor="alarm">Alarm</label>
                                    </div>
                                </div>
                            </div>
                            <div className="box u-mt-2">
                                <div className="box__header">Graphs</div>
                                <div className="box__body">
                                    <DataPlot title='Pressure' data={pressureValue} />
                                    <DataPlot title='BPM' />
                                    <DataPlot title='Volume' />
                                </div>
                            </div>
                        </div>
                        <div className="col--lg-4">
                            Pressure 1.3
                        </div>
                    </div>
                </div>
            </div>
        </MasterLayout>
    );
};

export default Index;
