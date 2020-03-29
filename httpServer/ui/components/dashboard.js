// eslint-disable-next-line no-unused-vars
import { Client } from '@hapi/nes/lib/client';
// eslint-disable-next-line no-unused-vars
import DataPlot from '../components/data-plot';
import dynamic from 'next/dynamic';
import cx from 'classnames';

// eslint-disable-next-line no-unused-vars
const SingleValueDisplay = dynamic(() => import('../components/single-value-display').then(mod => mod.SingleValueDisplay), { ssr: false });

// eslint-disable-next-line no-unused-vars
const SingleValueDisplaySettings = dynamic(() => import('../components/single-value-display').then(mod => mod.SingleValueDisplaySettings), { ssr: false });

// eslint-disable-next-line no-unused-vars
const SingleValueDisplaySettingsOnly = dynamic(() => import('../components/single-value-display').then(mod => mod.SingleValueDisplaySettingsOnly), { ssr: false });

import React from 'react';
import BellIcon from '../components/icons/bell';
import SaveIcon from '../components/icons/save';
import CaretIcon from '../components/icons/caret';

import { getApiUrl, getWsUrl } from '../helpers/api-urls';

import { toast } from 'react-toastify';
import OnOffIcon from './icons/onoff';

const refreshRate = 50;
const defaultXRange = 10000;
const integerPrecision = 1;
let serverTimeCorrection = 0;

export default class Dashboard extends React.Component {
    rawPressureValues = [];
    rawVolumeValues = [];
    rawTriggerValues = [];
    rawBpmValue = 0;
    animationInterval = 0;
    client = null;
    dirtySettings = {};
    previousSettings = {};

    saving = false;

    constructor(props) {
        super(props);

        this.state = {
            pressureValues: [],
            volumeValues: [],
            triggerValues: [],
            xLengthMs: defaultXRange,
            lastPressure: 0,
            lastVolume: 0,
            pressureStatus: 'normal',
            volumeStatus: 'normal',
            bpmStatus: 'normal',
            bpmValue: 0,
            patientName: '',
            patientAdmittanceDate: new Date(),
            patientInfo: '',
            settings: {
                RR: 0,
                VT: 0,
                PK: 0,
                TS: 0,
                TP: 0,
                IE: 0,
                PP: 0,
                TI: 0,
                PS: 0,
                RP: 0,
                ADPK: 0,
                ADVT: 0,
                ADPP: 0,
                MODE: 'V',
                ACTIVE: 0,
            },
            hasDirtySettings: false,
            updateSetting: (key, setting) => {
                const settings = { ...this.state.settings };

                settings[key] = setting;
                this.dirtySettings[key] = setting;
                this.setState({
                    settings,
                    hasDirtySettings: true,
                });
            },
        };
    }

    toggleMode() {
        if (this.state.settings.MODE === 'V') {
            this.state.updateSetting('MODE', 'P');
        } else {
            this.state.updateSetting('MODE', 'V');
        }
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

    async saveSetting(key, setting) {
        if (!this.saving) {
            this.saving = true;

            try {
                const tosend = {};
                tosend[key] = setting;

                // returncomplete also makes sure the python code and controller only receive the changed values
                await fetch(`${getApiUrl()}/api/settings?returncomplete=false`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(tosend),
                });

                this.previousSettings[key] = setting;

                this.setState({
                    settings: { ...this.state.settings, ...tosend },
                });
            } catch (e) {
                // todo: show error to the user
                console.log(e);
            }

            this.saving = false;
        }
    }

    async saveSettings(ev) {
        try {
            // returncomplete also makes sure the python code and controller only receive the changed values
            await fetch(`${getApiUrl()}/api/settings?returncomplete=false`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.dirtySettings),
            });

            this.dirtySettings = {};
            this.previousSettings = this.state.settings;

            this.setState({
                hasDirtySettings: false,
            });
        } catch (e) {
            // todo: show error to the user
            console.log(e);
        }

        ev.preventDefault();
    }

    revertSettings() {
        this.setState({
            settings: { ...this.previousSettings },
        });
    }

    async componentDidMount() {
        // Get patient information
        try {
            const patientInfoResponse = await fetch(`${getApiUrl()}/api/patient_info`);
            const patientInfoData = await patientInfoResponse.json();

            this.setState({
                patientName: patientInfoData.lastName + ', ' + patientInfoData.firstName,
                patientAdmittanceDate: new Date(patientInfoData.admittanceDate),
                patientInfo: patientInfoData.info,
            });
        } catch (ex) {
            console.log(ex);
            toast.error('Error fetching patient information.', {
                autoClose: false,
            });
        }

        try {
            const settingsResponse = await fetch(`${getApiUrl()}/api/settings`);
            const settingsData = await settingsResponse.json();

            this.setState({
                settings: { ...this.state.settings, ...settingsData },
            });
        } catch (ex) {
            console.log(ex);
            toast.error('Error fetching settings information.', {
                autoClose: false,
            });
        }

        // ask the server for the time
        if (!(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
            try {
                // kind of naive, but good enough for what we need
                const loop = 10;
                let summedTimeValues = 0;

                for (let j = 0; j < loop; j++) {
                    const now = new Date().getTime();
                    const serverTimeResponse = await fetch(`${getApiUrl()}/api/servertime`);
                    const serverTimeJson = await serverTimeResponse.json();

                    summedTimeValues += serverTimeJson.time - now;
                }

                serverTimeCorrection = Math.floor(summedTimeValues / loop);

                console.log(`Time has to be corrected with ${serverTimeCorrection} ms`);
            } catch (ex) {
                console.log(ex);
                toast.error('Error fetching time information.', {
                    autoClose: false,
                });
            }
        }

        // todo: no hardcoded values
        this.client = new Client(`${getWsUrl()}`);
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
        this.client.subscribe('/api/breathsperminute_values', (newPoints) => {
            const lastpoint = newPoints[newPoints.length - 1];

            self.rawBpmValue = lastpoint.value;
        });

        this.animationInterval = setInterval(() => {
            var now = new Date().getTime();
            const newPressureValues = [];
            const newVolumeValues = [];
            const newTriggerValues = [];

            this.rawPressureValues.forEach((point) => {
                var newX = (point.x - now - serverTimeCorrection);

                if (newX <= 0 && newX >= -this.state.xLengthMs) {
                    newPressureValues.push({
                        y: point.y / integerPrecision,
                        x: newX / 1000.0,
                    });
                }
            });

            this.rawVolumeValues.forEach((point) => {
                var newX = (point.x - now - serverTimeCorrection);

                if (newX <= 0 && newX >= -this.state.xLengthMs) {
                    newVolumeValues.push({
                        y: point.y / integerPrecision,
                        x: newX / 1000.0,
                    });
                }
            });

            this.rawTriggerValues.forEach((point) => {
                var newX = (point.x - now - serverTimeCorrection);

                if (newX <= 0 && newX >= -this.state.xLengthMs) {
                    newTriggerValues.push({
                        y: point.y * 400,
                        x: newX / 1000.0,
                    });
                }
            });

            self.setState({
                pressureValues: newPressureValues,
                volumeValues: newVolumeValues,
                triggerValues: newTriggerValues,
                pressureStatus: 'normal',
                bpmStatus: 'normal',
                volumeStatus: 'normal',
                bpmValue: self.rawBpmValue,
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
            <div className={ cx('page-dashboard', this.props.className) }>
                <div className="page-dashboard__header">
                    <ul className="list--inline page-dashboard__patient-info">
                        <li>{this.state.patientName}</li>
                        <li>{this.state.patientAdmittanceDate.toLocaleString()}</li>
                        <li>{this.state.patientInfo}</li>
                    </ul>
                    <div className="page-dashboard__timing-info" onClick={() => this.toggleMode()}>
                        <div>
                            T {new Date().toLocaleTimeString()}
                        </div>
                        <div>
                            Mode: {this.state.settings.MODE === 'V' ? 'Volume' : 'Pressure'}
                        </div>
                    </div>
                    <div className="page-dashboard__machine-info">
                        <button className="btn btn--primary" onClick={(ev) => this.saveSettings(ev) } disabled={!this.state.hasDirtySettings}>
                            <SaveIcon size="md" />
                        </button>
                        <button className={'btn ' + (this.state.settings.ACTIVE === 0 ? 'inactive' : 'running')}
                            onClick={() => this.saveSetting('ACTIVE', this.state.settings.ACTIVE === 0 ? 1 : 0)}>
                            <OnOffIcon size="md" />
                        </button>
                    </div>
                </div>

                <div className="page-dashboard__body">
                    <div className="page-dashboard__alert alert alert--danger" hidden>Trigger parameter has alert</div>

                    <div className="row u-mt-1">
                        <div className="col--md col--xxl-7">
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
                                    <DataPlot title='Pressure (cmH2O)'
                                        data={this.state.pressureValues}
                                        timeScale={this.state.xLengthMs / 1000.0}
                                        minY={-5}
                                        maxY={80}
                                        peak={this.state.settings.PK}
                                        threshold={this.state.settings.ADPK} />
                                    <DataPlot title='Volume (mL)'
                                        data={[this.state.volumeValues, this.state.triggerValues]}
                                        multipleDatasets={true}
                                        timeScale={this.state.xLengthMs / 1000.0}
                                        minY={-50}
                                        maxY={800}
                                        peak={this.state.settings.VT}
                                        threshold={this.state.settings.ADVT} />
                                </div>
                            </div>
                        </div>
                        <div className="col--md col--xxl-5">
                            <SingleValueDisplay
                                name="Pressure"
                                value={this.state.lastPressure}
                                status={this.state.pressureStatus}
                            >
                                <SingleValueDisplaySettings
                                    name="Set peak pressure"
                                    value={this.state.settings.PK}
                                    unit="cmH2O"
                                    settingKey={'PK'}
                                    decimal={false}
                                    step={1}
                                    updateValue={this.state.updateSetting}
                                />
                                <SingleValueDisplaySettings
                                    name="Threshold"
                                    value={this.state.settings.ADPK}
                                    unit="cmH2O"
                                    settingKey={'ADPK'}
                                    decimal={false}
                                    step={1}
                                    updateValue={this.state.updateSetting}
                                />
                            </SingleValueDisplay>
                            <SingleValueDisplay
                                name="Respiratory rate"
                                value={this.state.bpmValue}
                                status={this.state.bpmStatus}
                            >
                                <SingleValueDisplaySettings
                                    name="Set RR value"
                                    value={this.state.settings.RR}
                                    settingKey={'RR'}
                                    unit="bpm"
                                    step={1}
                                    decimal={false}
                                    updateValue={this.state.updateSetting}
                                />
                            </SingleValueDisplay>
                            <SingleValueDisplay
                                name="Volume"
                                value={this.state.lastVolume}
                                status={this.state.volumeStatus}>
                                <SingleValueDisplaySettings
                                    name="Set Value"
                                    value={this.state.settings.VT}
                                    settingKey={'VT'}
                                    unit="mL"
                                    step={10}
                                    decimal={false}
                                    updateValue={this.state.updateSetting}
                                />
                                <SingleValueDisplaySettings
                                    name="Threshold"
                                    value={this.state.settings.ADVT}
                                    settingKey={'ADVT'}
                                    unit="mL"
                                    step={10}
                                    decimal={false}
                                    updateValue={this.state.updateSetting}
                                />
                            </SingleValueDisplay>
                            {/* <SingleValueDisplay name="PEEP"
                                value={this.state.lastPressure}
                                status={this.state.pressureStatus}>
                                <SingleValueDisplaySettings name="Set PEEP"
                                    value={this.state.settings.PK}
                                    unit="cmH2O"
                                    settingKey={'PK'}
                                    decimal={false}
                                    updateValue={this.state.updateSetting} />
                                <SingleValueDisplaySettings name="Threshold"
                                    value={this.state.settings.ADPK}
                                    unit="cmH2O"
                                    settingKey={'ADPK'}
                                    decimal={false}
                                    updateValue={this.state.updateSetting} />
                            </SingleValueDisplay> */}
                            <SingleValueDisplaySettingsOnly>
                                <SingleValueDisplaySettings
                                    name="I/E"
                                    value={this.state.settings.IE}
                                    settingKey={'IE'}
                                    decimal={2}
                                    step={0.1}
                                    updateValue={this.state.updateSetting}
                                />
                                {
                                    this.state.settings.MODE === 'V' && (
                                        <SingleValueDisplaySettings
                                            name="Trigger sensitivity (V)"
                                            value={this.state.settings.TS}
                                            settingKey={'TS'}
                                            decimal={2}
                                            unit='L/min'
                                            step={0.1}
                                            updateValue={this.state.updateSetting}
                                        />
                                    )
                                }
                                {
                                    this.state.settings.MODE === 'P' && (
                                        <SingleValueDisplaySettings
                                            name="Trigger sensitivity (P)"
                                            value={this.state.settings.TP}
                                            settingKey={'TP'}
                                            decimal={2}
                                            unit='cmH2O'
                                            step={0.1}
                                            updateValue={this.state.updateSetting}
                                        />
                                    )
                                }
                                <SingleValueDisplaySettings
                                    name="Set PEEP"
                                    value={this.state.settings.PP}
                                    settingKey={'PP'}
                                    unit="cmH2O"
                                    decimal={false}
                                    step={1}
                                    updateValue={this.state.updateSetting}
                                />
                                <SingleValueDisplaySettings
                                    name="Set PEEP threshold"
                                    value={this.state.settings.ADPP}
                                    settingKey={'ADPP'}
                                    unit="cmH2O"
                                    decimal={false}
                                    step={1}
                                    updateValue={this.state.updateSetting}
                                />
                                <SingleValueDisplaySettings
                                    name="Set T/inhale"
                                    value={this.state.settings.TI}
                                    settingKey={'TI'}
                                    unit="sec"
                                    decimal={1}
                                    step={0.1}
                                    updateValue={this.state.updateSetting}
                                />
                                <SingleValueDisplaySettings
                                    name="Ramp"
                                    value={this.state.settings.RP}
                                    settingKey={'RP'}
                                    unit="sec"
                                    decimal={1}
                                    step={0.1}
                                    updateValue={this.state.updateSetting}
                                />
                                <SingleValueDisplaySettings
                                    name="Psupport"
                                    value={this.state.settings.PS}
                                    settingKey={'PS'}
                                    unit="cmH2O"
                                    decimal={false}
                                    step={1}
                                    updateValue={this.state.updateSetting}
                                />
                            </SingleValueDisplaySettingsOnly>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
};
