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
const minimumIE = 0.20;
const maximumIE = 0.80;
const minimumTInhale = 0.4;
const maximumTInhale = 10;
let serverTimeCorrection = 0;

const debugBreathingCycle = true;

export default class Dashboard extends React.Component {
    currentGraphTime = new Date().getTime();
    rawPressureValues = [];
    rawVolumeValues = [];
    rawFlowValues = [];
    rawTriggerValues = [];
    rawTargetPressureValues = [];
    rawBpmValue = 0;
    animationInterval = 0;
    client = null;
    dirtySettings = {};
    previousSettings = {};
    calculatedValues = {
        volumePerMinute: 0.0,
        pressurePlateau: 0.0,
        tidalVolume: 0.0,
        bpm: 0.0,
    };

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
            lastBpmValue: 0,
            pressureStatus: 'normal',
            volumeStatus: 'normal',
            bpmStatus: 'normal',
            patientName: '',
            patientAdmittanceDate: new Date(),
            patientInfo: '',
            showShutdownConfirmationDialog: false,
            showBeepConfirmationDialog: false,
            minTInhale: minimumTInhale,
            maxTInhale: maximumTInhale,
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
                MT: 0,
                RA: 0,
            },
            calculatedValues: {
                IE: 0.0,
                volumePerMinute: 0.0,
                respatoryRate: 0.0,
                pressurePlateau: 0.0,
                breathingCycleStart: null,
                exhaleMoment: null,
                tidalVolume: 0.0,
                breathingCycleEnd: null,
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
                        maxTInhale: Math.min(maximumTInhale, this.computeTInhale(settings.RR, maximumIE)),
                        minTInhale: Math.max(minimumTInhale, this.computeTInhale(settings.RR, minimumIE)),
                    });

                    // console.log("RR Changed to " + settings["RR"] + ", TI adjusted to " + settings["TI"]);
                } else if (key === 'IE') {
                    // I/E changed : keep Respiratory Rate, but change T/Inhale
                    settings.TI = this.computeTInhale(settings.RR, settings.IE);
                    this.dirtySettings.TI = settings.TI;

                    this.setState({
                        maxTInhale: Math.min(maximumTInhale, this.computeTInhale(settings.RR, maximumIE)),
                        minTInhale: Math.max(minimumTInhale, this.computeTInhale(settings.RR, minimumIE)),
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

    shouldShowAlarmState(alarm, mask) {
        return (alarm & mask) === mask;
    }

    computeTInhale(respiratoryRate, IE) {
        return (60 / parseFloat(respiratoryRate) * parseFloat(IE));
    }

    computeIE(respiratoryRate, TInhale) {
        return ((parseFloat(TInhale) * parseFloat(respiratoryRate)) / 60);
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
            const localTime = new Date(newPoint.loggedAt).getTime() - serverTimeCorrection;

            toArray.push({
                loggedAt: localTime,
                x: localTime - this.currentGraphTime,
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
        if (!(getWsUrl().indexOf('localhost') > -1 || getWsUrl().indexOf('127.0.0.1') > -1)) {
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

        this.client = new Client(`${getWsUrl()}`);
        await this.client.connect();

        this.client.subscribe('/api/pressure_values', (newPoints) => {
            this.processIncomingPoints(this.rawPressureValues, newPoints);
        });

        if (debugBreathingCycle) {
            this.client.subscribe('/api/targetpressure_values', (newPoints) => {
                this.processIncomingPoints(this.rawTargetPressureValues, newPoints);
            });
        }

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
        this.client.subscribe('/api/calculated_values', (newCalculatedValues) => {
            self.calculatedValues = newCalculatedValues;
        });

        this.client.subscribe('/api/settings', (newSettings) => {
            if (newSettings.breathingCycleStart) {
                return;
            }

            if (newSettings.breathingCycleEnd) {
                return;
            }

            if (newSettings.exhaleMoment) {
                return;
            }

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
            const newTargetPressureValues = [];
            const oldTargetPressureValues = [];

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

            if (debugBreathingCycle) {
                this.rawTargetPressureValues.forEach((point) => {
                    if (point.loggedAt >= this.currentGraphTime) {
                        if (point.x >= 0 && point.x < this.state.xLengthMs) {
                            newTargetPressureValues.push({
                                y: point.y / integerPrecision,
                                x: point.x / 1000,
                            });
                        }
                    } else {
                        if (point.x >= 0 && point.x < this.state.xLengthMs) {
                            oldTargetPressureValues.push({
                                y: point.y / integerPrecision,
                                x: point.x / 1000,
                            });
                        }
                    }
                });
            }

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

            if (debugBreathingCycle) {
                newPressureDataPlots.push({
                    data: newTargetPressureValues,
                    color: '#000',
                    fill: true,
                });
                newPressureDataPlots.push({
                    data: oldTargetPressureValues,
                    color: '#000',
                    fill: true,
                });
            }

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
                calculatedValues: { ...self.state.calculatedValues, ...self.calculatedValues },
                lastBpmValue: self.rawBpmValue,
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
        console.log('toggle active state');
        this.saveSetting('ACTIVE', parseInt(this.state.settings.ACTIVE) === 0 ? 1 : 0);
    }

    askActiveStateChange() {
        console.log('ask to change active state');
        // if we are in active mode, show the dialog box to confirm deactivation
        if (parseInt(this.state.settings.ACTIVE) === 2) {
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

    toggleMute(e) {
        this.saveSetting('MT', e.target.checked ? 0 : 1);
    }

    resetAlarm(e) {
        this.saveSetting('RA', 1);
    }

    getAlarmTexts(alarmValue) {
        const alarmTexts = {
            0: 'BPM too low',
            1: 'Alarm not defined',
            2: 'Alarm not defined',
            3: 'Alarm not defined',
            4: 'Peep not within thresholds',
            5: 'Pressure not within thresholds',
            6: 'Volume not within thresholds',
            7: 'Residual volume is not zero',
            8: 'Alarm not defined',
            9: 'Alarm not defined',
            10: 'Alarm not defined',
            11: 'Alarm not defined',
            12: 'Alarm not defined',
            13: 'Alarm not defined',
            14: 'Alarm not defined',
            15: 'Alarm not defined',
            16: 'Alarm not defined',
            17: 'Pressure not within thresholds (arduino)',
            18: 'Volume not within thresholds (arduino)',
            19: 'Peep not within thresholds (arduino)',
            20: 'Pressure sensor error',
            21: 'Machine is overheating',
            22: 'Flow sensor error',
            23: 'Pressure sensor calibration failed',
            24: 'Flow sensor calibration failed',
            25: 'Limit switch sensor error',
            26: 'HALL sensor error',
            27: 'No external power, switch to battery',
            28: 'Battery low',
            29: 'Battery critical',
            30: 'Fan not operational',
            31: 'GUI not found',
        };

        const messages = [];

        let shiftAlarm = alarmValue;

        for (let i = 0; i < 32; i++) {
            if ((shiftAlarm & 1) > 0) {
                messages.push(<div>{alarmTexts[i]}</div>);
            }

            shiftAlarm = shiftAlarm >> 1;
        }

        return messages;
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
                        <button className={'btn ' + (parseInt(this.state.settings.ACTIVE) === 2 ? 'running' : 'inactive')}
                            onClick={() => this.askActiveStateChange()}>
                            <OnOffIcon size="md" /><span>{parseInt(this.state.settings.ACTIVE) === 2 ? 'Stop ventilator' : 'Start ventilator'}</span>
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
                    <div className="page-dashboard__layout__body">
                        <div className="page-dashboard__layout__body__measurements">
                            <div className="page-dashboard__layout__body__measurements__settings">
                                <div>
                                    <SingleValueDisplaySettingsOnly>
                                        <div>
                                            <SingleValueDisplaySettings
                                                name="Peak pressure (PK)"
                                                value={this.state.settings.PK}
                                                unit="cmH2O"
                                                settingKey={'PK'}
                                                decimal={false}
                                                step={1}
                                                minValue={10}
                                                maxValue={70}
                                                warningThreshold={60}
                                                updateValue={this.state.updateSetting}
                                            />
                                            <SingleValueDisplaySettings
                                                name="PEEP level"
                                                value={this.state.settings.PP}
                                                settingKey={'PP'}
                                                unit="cmH2O"
                                                decimal={false}
                                                step={5}
                                                minValue={5}
                                                maxValue={20}
                                                updateValue={this.state.updateSetting}
                                            />
                                        </div>
                                        <div className={'single-value-display-settings__alarm'}>
                                            <SingleValueDisplaySettings
                                                name="Alarm limits PK"
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
                                                name="Alarm limits PEEP"
                                                value={this.state.settings.ADPP}
                                                settingKey={'ADPP'}
                                                unit="cmH2O"
                                                decimal={false}
                                                step={1}
                                                minValue={0}
                                                maxValue={100}
                                                updateValue={this.state.updateSetting}
                                            />
                                        </div>
                                    </SingleValueDisplaySettingsOnly>
                                    <SingleValueDisplaySettingsOnly>
                                        <SingleValueDisplaySettings
                                            name="Set RR value"
                                            value={this.state.settings.RR}
                                            settingKey={'RR'}
                                            unit="bpm"
                                            step={1}
                                            minValue={10}
                                            maxValue={35}
                                            decimal={false}
                                            updateValue={this.state.updateSetting}
                                        />
                                        <SingleValueDisplaySettings
                                            name="I/E"
                                            value={this.state.settings.IE}
                                            settingKey={'IE'}
                                            displayFunction={'toIERatio'}
                                            decimal={2}
                                            step={0.01}
                                            minValue={minimumIE}
                                            maxValue={maximumIE}
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
                                                    name="Trigger sens. (P)"
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
                                    <SingleValueDisplaySettingsOnly>
                                        <div>
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
                                        </div>
                                        <div className={'single-value-display-settings__alarm'}>
                                            <SingleValueDisplaySettings
                                                name="Alarm limits VT"
                                                value={this.state.settings.ADVT}
                                                settingKey={'ADVT'}
                                                unit="mL"
                                                step={10}
                                                minValue={0}
                                                maxValue={200}
                                                decimal={false}
                                                updateValue={this.state.updateSetting}
                                            />
                                        </div>
                                    </SingleValueDisplaySettingsOnly>

                                    <button className={'save-button'}
                                        onClick={(e) => this.saveSettings(e)}
                                        disabled={!this.state.hasDirtySettings}>
                                        Confirm settings
                                    </button>
                                </div>
                            </div>
                            <div className="page-dashboard__layout__body__measurements__graphs">
                                <form className="form form--horizontal-xs">
                                    <div className="form__group form__group--shrink">
                                        <div className="option-toggle option-toggle--danger">
                                            <input type="checkbox" id="alarm" checked={parseInt(this.state.settings.MT) === 0} onChange={(e) => this.toggleMute(e)} />
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
                                            breathingCycleStart={debugBreathingCycle ? this.state.breathingCycleStart : null}
                                            exhaleMoment={debugBreathingCycle ? this.state.exhaleMoment : null}
                                            breathingCycleEnd={debugBreathingCycle ? this.state.breathingCycleEnd : null}
                                            minY={-5}
                                            maxY={40}
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
                        </div>
                    </div>
                    <div className="page-dashboard__layout__sidebar">
                        <div>
                            <SingleValueDisplay
                                name="Pressure<br />Plat"
                                value={this.state.calculatedValues.pressurePlateau}
                                decimal={1}
                                status={'normal'}
                            ></SingleValueDisplay>
                            <SingleValueDisplay
                                name="Respiratory<br />rate"
                                value={this.state.calculatedValues.respatoryRate}
                                decimal={this.state.calculatedValues.respatoryRate < 10 ? 2 : 1}
                                status={'normal'}
                            ></SingleValueDisplay>
                            <SingleValueDisplay
                                name="Tidal volume (mL)"
                                value={this.state.calculatedValues.tidalVolume}
                                decimal={false}
                                status={'normal'}>
                            </SingleValueDisplay>
                            <SingleValueDisplay
                                name="Delivered volume (L/min)"
                                value={this.state.calculatedValues.volumePerMinute}
                                decimal={this.state.calculatedValues.volumePerMinute < 10 ? 2 : 1}
                                status={'normal'}>
                            </SingleValueDisplay>
                            <SingleValueDisplay
                                name="I/E"
                                value={this.state.calculatedValues.IE}
                                displayFunction={'toIERatio'}
                                decimal={2}
                                status={'normal'}>
                            </SingleValueDisplay>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
};
