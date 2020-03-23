// eslint-disable-next-line no-unused-vars
import MasterLayout from '../components/master-layout';
import { Client } from '@hapi/nes/lib/client';
// eslint-disable-next-line no-unused-vars
import DataPlot from '../components/data-plot';
import React from 'react';

export default class Index extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            pressureValues: [],
        };
    }

    useEffect() {
        const client = new Client('ws://localhost:3001');
        const start = async () => {
            await client.connect();

            client.subscribe('/api/pressure_values', (update) => {
                console.log(update);
            });
        };

        start();
    }

    render() {
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
                                        <DataPlot title='Pressure' data={this.state.pressureValues} />
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
            </MasterLayout>);
    }
};
