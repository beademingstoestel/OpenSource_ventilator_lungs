// eslint-disable-next-line no-unused-vars
import MasterLayout from '../components/master-layout';
import { Client } from '@hapi/nes/lib/client';
// eslint-disable-next-line no-unused-vars
import DataPlot from '../components/data-plot';
import SingleValueDisplay from '../components/single-value-display';
import React from 'react';
import DataCard from '../components/data-card';
import BellIcon from '../components/icons/bell';

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
            let newLastPressure = 0;
            let newLastVolume = 0;
            let newLastBpm = 0;

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

            if (newPressureValues.length > 0) {
                newLastPressure = newPressureValues[newPressureValues.length - 1].y;
            }

            if (newVolumeValues.length > 0) {
                newLastVolume = newVolumeValues[newVolumeValues.length - 1].y;
            }

            if (newBpmValues.length > 0) {
                newLastBpm = newBpmValues[newBpmValues.length - 1].y;
            }

            self.setState({
                pressureValues: newPressureValues,
                volumeValues: newVolumeValues,
                bpmValues: newBpmValues,
                lastPressure: newLastPressure,
                lastVolume: newLastVolume,
                lastBpm: newLastBpm,
                pressureStatus: 'normal',
                bpmStatus: 'warning',
                volumeStatus: 'alarm',
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
                        <ul className="list--inline page-dashboard__patient-info">
                            <li>Patient info</li>
                            <li>Normal intubated</li>
                            <li>Free field</li>
                        </ul>
                        <div className="page-dashboard__timing-info">
                            <div>
                                T 23:11:27
                            </div>
                            <div>
                                R 27:25:15
                            </div>
                        </div>
                        <div className="page-dashboard__machine-info">
                            Machine #00001
                        </div>
                    </div>

                    <div className="page-dashboard__body">
                        <div className="page-dashboard__alert alert alert--danger" hidden>Trigger parameter has alert</div>

                        <div className="row u-mt-1">
                            <div className="col--md-8">
                                <form className="form form--horizontal-xs">
                                    <div className="form__group">
                                        <label className="form__label" htmlFor="interval">Interval</label>
                                        <input type="range" min="5000" max="60000" step="5000" id="interval" defaultValue={defaultXRange} onChange={(ev) => this.setSliderValue(ev)} className="form__control" />
                                    </div>
                                    <div className="form__group form__group--shrink">
                                        <div className="option-toggle option-toggle--danger">
                                            <input type="checkbox" id="alarm" />
                                            <label htmlFor="alarm">
                                                <BellIcon size="md" />
                                            </label>
                                        </div>
                                    </div>
                                </form>
                                <div className="box u-mt-1">
                                    <div className="box__body">
                                        <DataPlot title='Pressure' data={this.state.pressureValues} timeScale={this.state.xLengthMs / 1000.0} minY={0} maxY={100} />
                                        <DataPlot title='BPM' data={this.state.bpmValues} timeScale={this.state.xLengthMs / 1000.0} minY={0} maxY={100} />
                                        <DataPlot title='Volume' data={this.state.volumeValues} timeScale={this.state.xLengthMs / 1000.0} minY={0} maxY={100} />
                                    </div>
                                </div>
                            </div>
                            <div className="col--md-4">
                                <SingleValueDisplay name="Pressure" value={this.state.lastPressure} status={this.state.pressureStatus} />
                                <SingleValueDisplay name="BPM" value={this.state.lastBpm} status={this.state.bpmStatus} />
                                <SingleValueDisplay name="Volume" value={this.state.lastVolume} status={this.state.volumeStatus} />
                                <SingleValueDisplay name="Trigger" value={this.state.lastTrigger} status={this.state.triggerStatus} />
                            </div>
                        </div>
                    </div>
                </div>
            </MasterLayout>
        );
    }
};
