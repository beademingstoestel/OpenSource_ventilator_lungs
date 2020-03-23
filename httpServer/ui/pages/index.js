// eslint-disable-next-line no-unused-vars
import MasterLayout from '../components/master-layout';
import { Client } from '@hapi/nes/lib/client';
// eslint-disable-next-line no-unused-vars
import DataPlot from '../components/data-plot';
import React from 'react';

const xLengthMs = 10000;
const refreshRate = 50;

export default class Index extends React.Component {
    rawPressureValues = [];
    animationInterval = 0;
    client = null;

    constructor(props) {
        super(props);

        this.state = {
            pressureValues: [],
            timeScale: xLengthMs / 1000,
        };
    }

    async componentDidMount() {
        // todo: no hardcoded values
        this.client = new Client('ws://localhost:3001');
        await this.client.connect();

        this.client.subscribe('/api/pressure_values', (newPoints) => {
            var cutoffTime = new Date().getTime() - xLengthMs;

            // shift old values
            let i = 0;
            for (i = 0; i < this.rawPressureValues.length; i++) {
                if (this.rawPressureValues[i].x > cutoffTime) {
                    break;
                }
            }

            if (i > 0) {
                this.rawPressureValues.splice(0, i);
            }

            newPoints.forEach((newPoint) => {
                this.rawPressureValues.push({
                    x: new Date(newPoint.loggedAt).getTime(),
                    y: newPoint.value,
                });
            });
        });

        const self = this;
        this.animationInterval = setInterval(() => {
            var now = new Date().getTime();
            const newValues = [];

            this.rawPressureValues.forEach((point) => {
                var newX = (point.x - now);

                if (newX <= 0 && newX >= -xLengthMs) {
                    newValues.push({
                        y: point.y,
                        x: newX / 1000.0,
                    });
                }
            });

            self.setState({
                pressureValues: newValues,
            });
        }, refreshRate);
    }

    componentWillUnmount() {
        clearInterval(this.animationInterval);
        // todo unsubscribe websocket
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
                                        <DataPlot title='Pressure' data={this.state.pressureValues} timeScale={this.state.timeScale} />
                                        <DataPlot title='BPM' data={this.state.pressureValues} timeScale={this.state.timeScale} />
                                        <DataPlot title='Volume' data={this.state.pressureValues} timeScale={this.state.timeScale} />
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
