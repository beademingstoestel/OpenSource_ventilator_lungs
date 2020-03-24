// eslint-disable-next-line no-unused-vars
import MasterLayout from '../components/master-layout';
import { Client } from '@hapi/nes/lib/client';
// eslint-disable-next-line no-unused-vars
import DataPlot from '../components/data-plot';
import React from 'react';

const refreshRate = 50;
const defaultXRange = 10000;

export default class Index extends React.Component {
    rawPressureValues = [];
    rawVolumeValues = [];
    rawBpmValues = [];
    animationInterval = 0;
    client = null;

    constructor(props) {
        super(props);

        this.state = {
            pressureValues: [],
            volumeValues: [],
            bpmValues: [],
            xLengthMs: defaultXRange,
            lastPressure: 0,
            lastVolume: 0,
            lastBpm: 0,
            lastTrigger: 0,
        };
    }

    processIncomingPoints(toArray, newPoints) {
        var cutoffTime = new Date().getTime() - this.state.xLengthMs;

        // shift old values
        let i = 0;
        for (i = 0; i < toArray.length; i++) {
            if (toArray[i].x > cutoffTime) {
                break;
            }
        }

        if (i > 0) {
            toArray.splice(0, i);
        }

        newPoints.forEach((newPoint) => {
            toArray.push({
                x: new Date(newPoint.loggedAt).getTime(),
                y: newPoint.value,
            });
        });
    }

    async componentDidMount() {
        // todo: no hardcoded values
        this.client = new Client('ws://localhost:3001');
        await this.client.connect();

        this.client.subscribe('/api/pressure_values', (newPoints) => {
            this.processIncomingPoints(this.rawPressureValues, newPoints);
        });

        this.client.subscribe('/api/volume_values', (newPoints) => {
            this.processIncomingPoints(this.rawVolumeValues, newPoints);
        });

        this.client.subscribe('/api/breathsperminute_values', (newPoints) => {
            this.processIncomingPoints(this.rawBpmValues, newPoints);
        });

        const self = this;
        this.animationInterval = setInterval(() => {
            var now = new Date().getTime();
            const newPressureValues = [];
            const newVolumeValues = [];
            const newBpmValues = [];

            this.rawPressureValues.forEach((point) => {
                var newX = (point.x - now);

                if (newX <= 0 && newX >= -this.state.xLengthMs) {
                    newPressureValues.push({
                        y: point.y,
                        x: newX / 1000.0,
                    });
                }
            });

            this.rawVolumeValues.forEach((point) => {
                var newX = (point.x - now);

                if (newX <= 0 && newX >= -this.state.xLengthMs) {
                    newVolumeValues.push({
                        y: point.y,
                        x: newX / 1000.0,
                    });
                }
            });

            this.rawBpmValues.forEach((point) => {
                var newX = (point.x - now);

                if (newX <= 0 && newX >= -this.state.xLengthMs) {
                    newBpmValues.push({
                        y: point.y,
                        x: newX / 1000.0,
                    });
                }
            });

            self.setState({
                pressureValues: newPressureValues,
                volumeValues: newVolumeValues,
                bpmValues: newBpmValues,
            });
        }, refreshRate);
    }

    async componentWillUnmount() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
        }

        try {
            await this.client.disconnect();
        } catch (e) {
            console.log(e);
        }
    }

    setSliderValue(ev) {
        this.setState({
            xLengthMs: ev.target.value,
        });
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
                                            <input type="range" min="5000" max="60000" step="5000" id="interval" defaultValue={defaultXRange} onChange={(ev) => this.setSliderValue(ev)} />
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
                                        <DataPlot title='Pressure' data={this.state.pressureValues} timeScale={this.state.xLengthMs / 1000.0} minY={0} maxY={100} />
                                        <DataPlot title='BPM' data={this.state.bpmValues} timeScale={this.state.xLengthMs / 1000.0} minY={0} maxY={100} />
                                        <DataPlot title='Volume' data={this.state.volumeValues} timeScale={this.state.xLengthMs / 1000.0} minY={0} maxY={100} />
                                    </div>
                                </div>
                            </div>
                            <div className="col--lg-4">
                                <div>Pressure: {this.state.lastPressure}</div>
                                <div>Volume: {this.state.lastVolume}</div>
                                <div>BPM: {this.state.lastBpm}</div>
                                <div>Trigger: {this.state.lastTrigger}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </MasterLayout>);
    }
};
