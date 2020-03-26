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
const integerPrecision = 10;

export default class Index extends React.Component {
    rawPressureValues = [];
    rawVolumeValues = [];
    rawTriggerValues = [];
    bpmValue = 0;
    animationInterval = 0;
    client = null;

    constructor(props) {
        super(props);

        this.state = {
            pressureValues: [],
            volumeValues: [],
            triggerValues: [],
            xLengthMs: defaultXRange,
            lastPressure: 0,
            lastVolume: 0,
            lastBpm: 0,
            patientName: '',
            patientAdmittanceDate: new Date(),
            patientInfo: '',
            settings: {
                RR: 0,
                VT: 0,
                PK: 0,
                TS: 0,
                IE: 0,
                PP: 0,
                ADPK: 0,
                ADVT: 0,
                ADPP: 0,
                MODE: 'V',
                ACTIVE: '',
            },
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
        // Get patient information
        try {
            const patientInfoResponse = await fetch('http://localhost:3001/api/patient_info');
            const patientInfoData = await patientInfoResponse.json();

            this.setState({
                patientName: patientInfoData.lastName + ', ' + patientInfoData.firstName,
                patientAdmittanceDate: new Date(patientInfoData.admittanceDate),
                patientInfo: patientInfoData.info,
            });

            const settingsResponse = await fetch('http://localhost:3001/api/settings');
            const settingsData = await settingsResponse.json();

            this.setState({
                settings: { ...this.state.settings, ...settingsData },
            });
        } catch (ex) {
            console.log(ex);
        }

        // todo: no hardcoded values
        this.client = new Client(`ws://${process.env.apiURL}`);
        await this.client.connect();

        this.client.subscribe('/api/pressure_values', (newPoints) => {
            this.processIncomingPoints(this.rawPressureValues, newPoints);
        });

        this.client.subscribe('/api/volume_values', (newPoints) => {
            this.processIncomingPoints(this.rawVolumeValues, newPoints);
        });

        this.client.subscribe('/api/trigger_values', (newPoints) => {
            this.processIncomingPoints(this.rawTriggerValues, newPoints);
        });

        const self = this;
        this.animationInterval = setInterval(() => {
            var now = new Date().getTime();
            const newPressureValues = [];
            const newVolumeValues = [];
            const newTriggerValues = [];
            let newLastPressure = 0;
            let newLastVolume = 0;

            this.rawPressureValues.forEach((point) => {
                var newX = (point.x - now);

                if (newX <= 0 && newX >= -this.state.xLengthMs) {
                    newPressureValues.push({
                        y: point.y / integerPrecision,
                        x: newX / 1000.0,
                    });
                }
            });

            this.rawVolumeValues.forEach((point) => {
                var newX = (point.x - now);

                if (newX <= 0 && newX >= -this.state.xLengthMs) {
                    newVolumeValues.push({
                        y: point.y / integerPrecision,
                        x: newX / 1000.0,
                    });
                }
            });

            this.rawTriggerValues.forEach((point) => {
                var newX = (point.x - now);

                if (newX <= 0 && newX >= -this.state.xLengthMs) {
                    newTriggerValues.push({
                        y: point.y / integerPrecision,
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

            self.setState({
                pressureValues: newPressureValues,
                volumeValues: newVolumeValues,
                triggerValues: newTriggerValues,
                pressureStatus: 'normal',
                bpmStatus: 'warning',
                volumeStatus: 'alarm',
                lastPressure: newPressureValues.length > 0 ? newPressureValues[newPressureValues.length - 1].y : 0.0,
                lastVolume: newVolumeValues.length > 0 ? newVolumeValues[newVolumeValues.length - 1].y : 0.0,
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
                            <li>{this.state.patientName}</li>
                            <li>{this.state.patientAdmittanceDate.toLocaleDateString() }</li>
                            <li>{this.state.patientInfo}</li>
                        </ul>
                        <div className="page-dashboard__timing-info">
                            <div>
                                T {new Date().toLocaleTimeString()}
                            </div>
                            <div>
                                Mode: {this.state.settings.MODE}
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
                                        <DataPlot title='Pressure'
                                            data={this.state.pressureValues}
                                            timeScale={this.state.xLengthMs / 1000.0}
                                            minY={0}
                                            maxY={80} />
                                        <DataPlot title='Volume'
                                            data={[this.state.volumeValues, this.state.triggerValues]}
                                            multipleDatasets={true}
                                            timeScale={this.state.xLengthMs / 1000.0}
                                            minY={0}
                                            maxY={600} />
                                    </div>
                                </div>
                            </div>
                            <div className="col--md-4">
                                <SingleValueDisplay name="Pressure" value={this.state.lastPressure} status={this.state.pressureStatus} />
                                <div className={'single-value-display single-value-display--default'}>
                                    <div className="single-value-display__name">Respatory rate</div>
                                    <div className="single-value-display__value">{ this.state.lastBpm }</div>
                                </div>
                                <SingleValueDisplay name="Volume" value={this.state.lastVolume} status={this.state.volumeStatus} />
                            </div>
                        </div>
                    </div>
                </div>
            </MasterLayout>
        );
    }
};
