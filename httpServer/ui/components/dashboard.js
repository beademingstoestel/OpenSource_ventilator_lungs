// eslint-disable-next-line no-unused-vars
import { Client } from '@hapi/nes/lib/client';
// eslint-disable-next-line no-unused-vars
import DataPlot from '../components/data-plot';
import dynamic from 'next/dynamic';
import cx from 'classnames';
import React from 'react';
import BellIcon from '../components/icons/bell';
import SaveIcon from '../components/icons/save';
import GearIcon from '../components/icons/gear';
import CaretIcon from '../components/icons/caret';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import { getApiUrl, getWsUrl } from '../helpers/api-urls';

import { toast } from 'react-toastify';
import OnOffIcon from './icons/onoff';

// eslint-disable-next-line no-unused-vars
const SingleValueDisplay = dynamic(() => import('../components/single-value-display').then(mod => mod.SingleValueDisplay), { ssr: false });

// eslint-disable-next-line no-unused-vars
const SingleValueDisplaySettings = dynamic(() => import('../components/single-value-display').then(mod => mod.SingleValueDisplaySettings), { ssr: false });

// eslint-disable-next-line no-unused-vars
const SingleValueDisplaySettingsOnly = dynamic(() => import('../components/single-value-display').then(mod => mod.SingleValueDisplaySettingsOnly), { ssr: false });

const refreshRate = 100;
const defaultXRange = 10000;
const integerPrecision = 1;
const minimumIE = 0.25;
const maximumIE = 0.50;
let serverTimeCorrection = 0;

export default class Dashboard extends React.Component {
    currentGraphTime = new Date().getTime();
    rawPressureValues = [];
    rawVolumeValues = [];
    rawFlowValues = [];
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
            pressureDataPlots: [],
            flowDataPlots: [],
            volumeValues: [],
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
            showShutdownConfirmationDialog: false,
            showBeepConfirmationDialog: false,
            minTInhale: 0,
            maxTInhale: 0,
            maxPSupport: 35,
            settings: {
                RR: 20,
                VT: 400,
                PK: 35,
                TS: 0,
                TP: 0,
                IE: 0.5,
                PP: 10,
                TI: 6, // 6 because IE = 0.5 and RR = 20
                PS: 35,
                RP: 0.5,
                ADPK: 10,
                ADVT: 0,
                ADPP: 0,
                MODE: 0,
                ACTIVE: 0,
            },
            hasDirtySettings: false,
            updateSetting: (key, setting) => {
                const settings = { ...this.state.settings };
                settings[key] = setting;
                this.dirtySettings[key] = setting;

                // Special treatment for some of the items
                if (key === 'PK') {
                    // Peak pressure changed : adjust the psupport value if needed (must be <= to peak pressure)
                    if (settings.PS > settings.PK) {
                        settings.PS = settings.PK;
                        this.dirtySettings.PS = settings.PS;
                    }

                    this.setState({ maxPSupport: settings.PK }); // adjust the maximum allowed in any case
                } else if (key === 'RR') {
                    // Respiratory rate changed : keep I/E, but change T/Inhale
                    settings.TI = this.computeTInhale(settings.RR, settings.IE);
                    this.dirtySettings.TI = settings.TI;

                    this.setState({
                        minTInhale: this.computeTInhale(settings.RR, maximumIE),
                        maxTInhale: this.computeTInhale(settings.RR, minimumIE),
                    });

                    // console.log("RR Changed to " + settings["RR"] + ", TI adjusted to " + settings["TI"]);
                } else if (key === 'IE') {
                    // I/E changed : keep Respiratory Rate, but change T/Inhale
                    settings.TI = this.computeTInhale(settings.RR, settings.IE);
                    this.dirtySettings.TI = settings.TI;

                    this.setState({
                        minTInhale: this.computeTInhale(settings.RR, maximumIE),
                        maxTInhale: this.computeTInhale(settings.RR, minimumIE),
                    });

                    // console.log("IE Changed to " + settings["IE"] + ", TI adjusted to " + settings["TI"]);
                } else if (key === 'TI') {
                    // T/Inhale changed : keep Respiratory Rate, but change I/E
                    var newIE = this.computeIE(settings.RR, settings.TI);
                    console.log('new IE: ' + newIE);

                    // If the user tries to lower the IE below the minimum allowed (0.25) ..
                    if ((newIE < settings.IE) && (newIE < minimumIE)) {
                        // .. then keep the TI to the acceptable value at 0.25
                        settings.TI = this.computeTInhale(settings.RR, minimumIE);
                        this.dirtySettings.TI = settings.TI;
                    } else if ((newIE < settings.IE) && (newIE > maximumIE)) {
                        // .. or tries to increase it above the maximum allowed (0.5) ..
                        // .. then keep the TI to the acceptable value at 0.5
                        settings.TI = this.computeTInhale(settings.RR, maximumIE);
                        this.dirtySettings.TI = settings.TI;
                    }

                    // recalculte the IE in any case, know that we know that the TI is kept with range, this also clears rounding errors
                    settings.IE = this.computeIE(settings.RR, settings.TI);
                    this.dirtySettings.IE = settings.IE;

                    // console.log("TI Changed to " + settings["TI"] + ", IE adjusted to " + settings["IE"]);
                }

                this.setState({
                    settings,
                    hasDirtySettings: true,
                });
            },
        };
    }

    computeTInhale(respiratoryRate, IE) {
        return (60 / (respiratoryRate * IE)).toFixed(1);
    }

    computeIE(respiratoryRate, TInhale) {
        return ((60 / respiratoryRate) / TInhale).toFixed(2);
    }

    toggleMode() {
        if (this.state.settings.MODE === 0) {
            this.state.updateSetting('MODE', 1);
        } else {
            this.state.updateSetting('MODE', 0);
        }
    }

    processIncomingPoints(toArray, newPoints) {
        var cutoffTime = new Date().getTime() - this.state.xLengthMs;

        // shift old values
        let removeSplicePoint = 0;
        for (let i = 0; i < toArray.length; i++) {
            if (toArray[i].loggedAt > cutoffTime + 200) {
                removeSplicePoint = i;
                break;
            }
        }

        if (removeSplicePoint > 0) {
            toArray.splice(0, removeSplicePoint);
        }

        newPoints.forEach((newPoint) => {
            toArray.push({
                loggedAt: new Date(newPoint.loggedAt).getTime(),
                x: new Date(newPoint.loggedAt).getTime() - this.currentGraphTime,
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
        if (!this.saving) {
            this.saving = true;

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
            this.saving = false;
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

        this.client.subscribe('/api/flow_values', (newPoints) => {
            this.processIncomingPoints(this.rawFlowValues, newPoints);
        });

        this.client.subscribe('/api/trigger_values', (newPoints) => {
            this.processIncomingPoints(this.rawTriggerValues, newPoints);
        });

        const self = this;
        this.client.subscribe('/api/settings', (newSettings) => {
            self.setState({
                settings: { ...self.state.settings, ...newSettings },
            });
        });

        this.client.subscribe('/api/breathsperminute_values', (newPoints) => {
            const lastpoint = newPoints[newPoints.length - 1];

            self.rawBpmValue = lastpoint.value;
        });

        this.animationInterval = setInterval(() => {
            const now = new Date().getTime();

            if (this.currentGraphTime + this.state.xLengthMs < now) {
                this.currentGraphTime = now;
            }

            const newPressureValues = [];
            const oldPressureValues = [];
            const newVolumeValues = [];
            const oldVolumeValues = [];
            const newTriggerValues = [];
            const oldTriggerValues = [];
            const newFlowValues = [];
            const oldFlowValues = [];

            this.rawPressureValues.forEach((point) => {
                if (point.loggedAt >= this.currentGraphTime) {
                    if (point.x >= 0 && point.x < this.state.xLengthMs) {
                        newPressureValues.push({
                            y: point.y / integerPrecision,
                            x: point.x / 1000,
                        });
                    }
                } else {
                    if (point.x >= 0 && point.x < this.state.xLengthMs) {
                        oldPressureValues.push({
                            y: point.y / integerPrecision,
                            x: point.x / 1000,
                        });
                    }
                }
            });

            this.rawVolumeValues.forEach((point) => {
                if (point.loggedAt >= this.currentGraphTime) {
                    if (point.x >= 0 && point.x < this.state.xLengthMs) {
                        newVolumeValues.push({
                            y: point.y / integerPrecision,
                            x: point.x / 1000.0,
                        });
                    }
                } else {
                    if (point.x >= 0 && point.x < this.state.xLengthMs) {
                        oldVolumeValues.push({
                            y: point.y / integerPrecision,
                            x: point.x / 1000,
                        });
                    }
                }
            });

            this.rawTriggerValues.forEach((point) => {
                if (point.loggedAt >= this.currentGraphTime) {
                    if (point.x >= 0 && point.x < this.state.xLengthMs) {
                        newTriggerValues.push({
                            y: point.y * 40,
                            x: point.x / 1000.0,
                        });
                    }
                } else {
                    if (point.x >= 0 && point.x < this.state.xLengthMs) {
                        oldTriggerValues.push({
                            y: point.y * 40,
                            x: point.x / 1000,
                        });
                    }
                }
            });

            this.rawFlowValues.forEach((point) => {
                if (point.loggedAt >= this.currentGraphTime) {
                    if (point.x >= 0 && point.x < this.state.xLengthMs) {
                        newFlowValues.push({
                            y: point.y,
                            x: point.x / 1000.0,
                        });
                    }
                } else {
                    if (point.x >= 0 && point.x < this.state.xLengthMs) {
                        oldFlowValues.push({
                            y: point.y / integerPrecision,
                            x: point.x / 1000,
                        });
                    }
                }
            });

            const newPressureDataPlots = [
                {
                    data: newPressureValues,
                    color: '#ff6600',
                    fill: true,
                },
                {
                    data: oldPressureValues,
                    color: '#ff6600',
                    fill: true,
                },
            ];
            const newFlowDataPlots = [
                {
                    data: newFlowValues,
                    color: '#ff6600',
                    fill: true,
                },
                {
                    data: oldFlowValues,
                    color: '#ff6600',
                    fill: true,
                },
            ];

            // show the trigger in the right graph depending on the mode
            if (this.state.settings.MODE === 1) {
                newPressureDataPlots.push(
                    {
                        data: newTriggerValues,
                        color: '#003399',
                        fill: false,
                    },
                    {
                        data: oldTriggerValues,
                        color: '#003399',
                        fill: false,
                    },
                );
            } else {
                newFlowDataPlots.push(
                    {
                        data: newTriggerValues,
                        color: '#003399',
                        fill: false,
                    },
                    {
                        data: oldTriggerValues,
                        color: '#003399',
                        fill: false,
                    },
                );
            }

            self.setState({
                pressureDataPlots: newPressureDataPlots,
                flowDataPlots: newFlowDataPlots,
                volumeValues: [
                    {
                        data: newVolumeValues,
                        color: '#ff6600',
                        fill: true,
                    },
                    {
                        data: oldVolumeValues,
                        color: '#ff6600',
                        fill: true,
                    },
                ],
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

    toggleActiveState() {
        this.saveSetting('ACTIVE', this.state.settings.ACTIVE === 0 ? 1 : 0);
    }

    askActiveStateChange() {
        // if we are in active mode, show the dialog box to confirm deactivation
        if (this.state.settings.ACTIVE === 2) {
            this.setState({ showShutdownConfirmationDialog: true });
        } else {
            // go to active state 1 -> sounds beep
            this.saveSetting('ACTIVE', 1);
            this.setState({ showBeepConfirmationDialog: true });
        }
    }

    // Handle the closing of the shutdown dialog box
    handleShutDownDialogClose(ev, validateClose) {
        this.setState({ showShutdownConfirmationDialog: false });

        // If the user validates the close (clicked on YES), then actually do the change of state
        if (validateClose) {
            this.saveSetting('ACTIVE', 0);
        }
    }

    // Handle the closing of the beep heard dialog box
    handleBeepHeardClose(ev, validateClose) {
        this.setState({ showBeepConfirmationDialog: false });

        // If the user validates the close (clicked on YES), then actually do the change of state
        if (validateClose) {
            this.saveSetting('ACTIVE', 2);
        } else {
            this.saveSetting('ACTIVE', 0);
        }
    }

    render() {
        return (
            <div className={cx('page-dashboard', this.props.className)}>
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
                            Mode: {this.state.settings.MODE === 0 ? 'Flow' : 'Pressure'}
                        </div>
                    </div>
                    <div className="page-dashboard__machine-info">
                        <button className={'btn ' + (this.state.settings.ACTIVE === 2 ? 'running' : 'inactive')}
                            onClick={() => this.askActiveStateChange()}>
                            <OnOffIcon size="md" /><span>{this.state.settings.ACTIVE === 2 ? 'Stop ventilator' : 'Start ventilator'}</span>
                        </button>

                        <Dialog open={this.state.showShutdownConfirmationDialog}
                            onClose={(ev) => this.handleShutDownDialogClose(ev, false)}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description">
                            <DialogTitle id="alert-dialog-title">{'Stop the ventilator?'}</DialogTitle>
                            <DialogContent>
                                <DialogContentText id="alert-dialog-description">
                                    Are you sure you want to stop the ventilator?
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={(ev) => this.handleShutDownDialogClose(ev, false)} color="secondary">
                                    No
                                </Button>
                                <Button onClick={(ev) => this.handleShutDownDialogClose(ev, true)} color="primary" autoFocus>
                                    Yes
                                </Button>
                            </DialogActions>
                        </Dialog>

                        <Dialog open={this.state.showBeepConfirmationDialog}
                            onClose={(ev) => this.handleBeepHeardClose(ev, false)}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description">
                            <DialogTitle id="alert-dialog-title">{'Confirm startup?'}</DialogTitle>
                            <DialogContent>
                                <DialogContentText id="alert-dialog-description">
                                    Did you hear the two beeps?
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={(ev) => this.handleBeepHeardClose(ev, false)} color="secondary">
                                    No
                                </Button>
                                <Button onClick={(ev) => this.handleBeepHeardClose(ev, true)} color="primary" autoFocus>
                                    Yes
                                </Button>
                            </DialogActions>
                        </Dialog>

                    </div>
                </div>

                <div className="page-dashboard__layout">
                    <div className="page-dashboard__layout__sidebar">
                        <div>
                            <SingleValueDisplay
                                name="Pressure"
                                value={this.state.lastPressure}
                                status={this.state.pressureStatus}
                                decimal={false}
                            ></SingleValueDisplay>
                            <SingleValueDisplay
                                name="Respiratory<br />rate"
                                value={this.state.bpmValue}
                                status={this.state.bpmStatus}
                                decimal={false}
                            ></SingleValueDisplay>
                            <SingleValueDisplay
                                name="Volume"
                                value={this.state.lastVolume}
                                decimal={false}
                                status={this.state.volumeStatus}>
                            </SingleValueDisplay>
                        </div>
                    </div>
                    <div className="page-dashboard__layout__body">
                        <div className="page-dashboard__alert alert alert--danger" hidden>Trigger parameter has alert</div>
                        <div className="page-dashboard__layout__body__measurements">
                            <div className="page-dashboard__layout__body__measurements__graphs">
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
                                            data={this.state.pressureDataPlots}
                                            multipleDatasets={true}
                                            timeScale={this.state.xLengthMs / 1000.0}
                                            minY={-5}
                                            maxY={80}
                                            peak={this.state.settings.PK}
                                            threshold={this.state.settings.ADPK} />
                                        <DataPlot title='Flow (L/min)'
                                            data={this.state.flowDataPlots}
                                            multipleDatasets={true}
                                            timeScale={this.state.xLengthMs / 1000.0}
                                            minY={-100}
                                            maxY={100} />
                                        <DataPlot title='Volume (mL)'
                                            data={this.state.volumeValues}
                                            multipleDatasets={true}
                                            timeScale={this.state.xLengthMs / 1000.0}
                                            minY={-50}
                                            maxY={800}
                                            peak={this.state.settings.VT}
                                            threshold={this.state.settings.ADVT} />
                                    </div>
                                </div>
                            </div>
                            <div className="page-dashboard__layout__body__measurements__settings">
                                <div>
                                    <SingleValueDisplaySettingsOnly>
                                        <SingleValueDisplaySettings
                                            name="Peak pressure (PP)"
                                            value={this.state.settings.PK}
                                            unit="cmH2O"
                                            settingKey={'PK'}
                                            decimal={false}
                                            step={1}
                                            minValue={10}
                                            maxValue={70}
                                            warningThreshold={36}
                                            updateValue={this.state.updateSetting}
                                        />
                                        <SingleValueDisplaySettings
                                            name="Threshold PP"
                                            value={this.state.settings.ADPK}
                                            unit="cmH2O"
                                            settingKey={'ADPK'}
                                            decimal={false}
                                            step={1}
                                            minValue={0}
                                            maxValue={35}
                                            updateValue={this.state.updateSetting}
                                        />
                                        <SingleValueDisplaySettings
                                            name="Set PEEP"
                                            value={this.state.settings.PP}
                                            settingKey={'PP'}
                                            unit="cmH2O"
                                            decimal={false}
                                            step={5}
                                            minValue={5}
                                            maxValue={20}
                                            updateValue={this.state.updateSetting}
                                        />
                                        <SingleValueDisplaySettings
                                            name="Set PEEP threshold"
                                            value={this.state.settings.ADPP}
                                            settingKey={'ADPP'}
                                            unit="cmH2O"
                                            decimal={false}
                                            step={1}
                                            minValue={0}
                                            maxValue={100}
                                            updateValue={this.state.updateSetting}
                                        />
                                    </SingleValueDisplaySettingsOnly>
                                    <SingleValueDisplaySettingsOnly>
                                        <SingleValueDisplaySettings
                                            name="Tidal volume (TV)"
                                            value={this.state.settings.VT}
                                            settingKey={'VT'}
                                            unit="mL"
                                            step={50}
                                            minValue={250}
                                            maxValue={800}
                                            decimal={false}
                                            updateValue={this.state.updateSetting}
                                        />
                                        <SingleValueDisplaySettings
                                            name="Threshold VT"
                                            value={this.state.settings.ADVT}
                                            settingKey={'ADVT'}
                                            unit="mL"
                                            step={10}
                                            minValue={0}
                                            maxValue={200}
                                            decimal={false}
                                            updateValue={this.state.updateSetting}
                                        />
                                    </SingleValueDisplaySettingsOnly>
                                    <SingleValueDisplaySettingsOnly>
                                        <SingleValueDisplaySettings
                                            name="Set RR value"
                                            value={this.state.settings.RR}
                                            settingKey={'RR'}
                                            unit="bpm"
                                            step={2}
                                            minValue={10}
                                            maxValue={30}
                                            decimal={false}
                                            updateValue={this.state.updateSetting}
                                        />
                                        <SingleValueDisplaySettings
                                            name="I/E"
                                            value={this.state.settings.IE}
                                            settingKey={'IE'}
                                            decimal={2}
                                            step={0.05}
                                            minValue={0.25}
                                            maxValue={0.5}
                                            updateValue={this.state.updateSetting}
                                        />
                                        <SingleValueDisplaySettings
                                            name="Set T/inhale"
                                            value={this.state.settings.TI}
                                            settingKey={'TI'}
                                            unit="sec"
                                            decimal={1}
                                            step={0.1}
                                            minValue={this.state.minTInhale}
                                            maxValue={this.state.maxTInhale}
                                            updateValue={this.state.updateSetting}
                                        />
                                        <SingleValueDisplaySettings
                                            name="Ramp"
                                            value={this.state.settings.RP}
                                            settingKey={'RP'}
                                            unit="sec"
                                            decimal={1}
                                            step={0.1}
                                            minValue={0.3}
                                            maxValue={1.0}
                                            updateValue={this.state.updateSetting}
                                        />
                                        {
                                            this.state.settings.MODE === 0 && (
                                                <SingleValueDisplaySettings
                                                    name="Trigger sens. (V)"
                                                    value={this.state.settings.TS}
                                                    settingKey={'TS'}
                                                    decimal={2}
                                                    unit='L/min'
                                                    step={0.1}
                                                    minValue={0}
                                                    maxValue={10}
                                                    updateValue={this.state.updateSetting}
                                                />
                                            )
                                        }
                                        {
                                            this.state.settings.MODE === 1 && (
                                                <SingleValueDisplaySettings
                                                    name="Trigger sensitivity (P)"
                                                    value={this.state.settings.TP}
                                                    settingKey={'TP'}
                                                    decimal={2}
                                                    unit='cmH2O'
                                                    step={0.1}
                                                    minValue={0}
                                                    maxValue={10}
                                                    updateValue={this.state.updateSetting}
                                                />
                                            )
                                        }
                                        <SingleValueDisplaySettings
                                            name="Psupport"
                                            value={this.state.settings.PS}
                                            settingKey={'PS'}
                                            unit="cmH2O"
                                            decimal={false}
                                            step={1}
                                            minValue={10}
                                            maxValue={this.state.maxPSupport}
                                            updateValue={this.state.updateSetting}
                                        />
                                    </SingleValueDisplaySettingsOnly>

                                    <button className={'save-button'} onClick={(e) => this.saveSettings(e)} disabled={!this.state.hasDirtySettings}>Confirm settings</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
};
