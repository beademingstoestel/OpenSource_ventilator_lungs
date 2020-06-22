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
import OnOffIcon from '../components/icons/onoff';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { modeToAbbreviation, modeToBooleans } from '../helpers/modes';

import { getApiUrl, getWsUrl } from '../helpers/api-urls';

import { toast } from 'react-toastify';
import AlarmOverview from './alarm-overview';
import Settings from './settings';
import MessagingCenter from '../helpers/messaging';
import Alarms from './alarms';
import CurrentValues from './current-values';

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
    rawMeasurementsValues = [];
    animationInterval = 0;
    client = null;
    dirtySettings = {};
    previousSettings = {};
    calculatedValues = {
        volumePerMinute: 5,
        pressurePlateau: 10,
        tidalVolume: 2,
        respatoryRate: 18,
        IE: 0,
    };

    mutedAt = new Date();

    saving = false;

    constructor(props) {
        super(props);

        this.state = {
            muteCountDown: 60,
            pressureDataPlots: [],
            flowDataPlots: [],
            volumeValues: [],
            xLengthMs: defaultXRange,
            currentValues: {
                pressure: 10,
                volume: 5,
                bpmValue: 20,
                fiO2Value: 0.21,
                fiO2InhaleValue: 0.21,
                fiO2ExhaleValue: 0.21,
            },
            pressureStatus: 'normal',
            volumeStatus: 'normal',
            bpmStatus: 'normal',
            patientName: '',
            patientAdmittanceDate: new Date(),
            patientInfo: '',
            showCalibrationDialog: false,
            showShutdownConfirmationDialog: false,
            showBeepConfirmationDialog: false,
            minTInhale: minimumTInhale,
            maxTInhale: maximumTInhale,
            maxPSupport: 35,
            showSettings: false,
            showAlarmSettings: false,
            settings: {
                RR: 20,
                HRR: 30,
                LRR: 19,
                RVOL: 50,
                VT: 400,
                PK: 35,
                TS: 0,
                TP: 0,
                IE: 0.5,
                PP: 10,
                TI: 1.5, // 1.5 because IE = 0.5 and RR = 20
                PS: 35,
                RP: 0.5,
                ADPK: 10,
                HPK: 40,
                LPK: 20,
                ADVT: 0,
                ADPP: 0,
                MODE: 0,
                ACTIVE: -6,
                MT: 0,
                RA: 0,
                FIO2: 0.2,
                ADFIO2: 0.1,
            },
            calculatedValues: {
                IE: 20,
                volumePerMinute: 10,
                respatoryRate: 10,
                pressurePlateau: 10,
                lungCompliance: 10,
                lungResistance: 10,
                breathingCycleStart: null,
                exhaleMoment: null,
                tidalVolume: 5,
                breathingCycleEnd: null,
            },
            hasDirtySettings: false,
            updateSetting: async (key, setting) => {
                const settings = { ...this.state.settings };
                const previousValue = settings[key];
                settings[key] = setting;
                this.dirtySettings[key] = setting;

                // Special treatment for some of the items
                if (key === 'MODE') {
                    const previousMode = modeToBooleans(previousValue);
                    const currentMode = modeToBooleans(setting);

                    if (currentMode.isVolumeLimited && !previousMode.isVolumeLimited) {
                        // set the threshold thus that the minimum limit is the same as the minimum volume before
                        settings.ADVT = Math.abs(settings.ADVT - settings.VT);
                        this.dirtySettings.ADVT = settings.ADVT;
                    } else if (!currentMode.isVolumeLimited && previousMode.isVolumeLimited) {
                        // set the minimum volume equal to the previous lower limit
                        settings.ADVT = Math.max(0, settings.VT - settings.ADVT);
                        this.dirtySettings.ADVT = settings.ADVT;
                    }
                } else if (key === 'PK') {
                    // Peak pressure changed : adjust the psupport value if needed (must be <= to peak pressure)
                    if (settings.PS > settings.PK) {
                        settings.PS = settings.PK;
                        this.dirtySettings.PS = settings.PS;
                    }

                    if (settings.LPK > settings.PK - 5) {
                        settings.LPK = settings.PK - 5;
                        this.dirtySettings.LPK = settings.LPK;
                    }

                    if (settings.HPK < settings.PK + 5) {
                        settings.HPK = settings.PK + 5;
                        this.dirtySettings.HPK = settings.HPK;
                    }

                    settings.ADPK = settings.HPK - settings.PK;
                    this.dirtySettings.ADPK = settings.ADPK;

                    this.setState({ maxPSupport: settings.PK }); // adjust the maximum allowed in any case
                } else if (key === 'HPK') {
                    settings.ADPK = settings.HPK - settings.PK;
                    this.dirtySettings.ADPK = settings.ADPK;
                } else if (key === 'RR') {
                    // Respiratory rate changed : keep I/E, but change T/Inhale
                    settings.TI = this.computeTInhale(settings.RR, settings.IE);
                    this.dirtySettings.TI = settings.TI;

                    this.setState({
                        maxTInhale: Math.min(maximumTInhale, this.computeTInhale(settings.RR, maximumIE)),
                        minTInhale: Math.max(minimumTInhale, this.computeTInhale(settings.RR, minimumIE)),
                    });

                    if (settings.HRR < settings.RR) {
                        settings.HRR = settings.RR;
                        this.dirtySettings.HRR = settings.HRR;
                    }

                    if (settings.LRR >= settings.RR) {
                        settings.LRR = settings.RR - 1;
                        this.dirtySettings.LRR = settings.LRR;
                    }

                    if (settings.RP + 0.1 >= settings.TI) {
                        settings.RP = settings.TI - 0.1;
                        this.dirtySettings.RP = settings.RP;
                    }

                    // console.log("RR Changed to " + settings["RR"] + ", TI adjusted to " + settings["TI"]);
                } else if (key === 'IE') {
                    // I/E changed : keep Respiratory Rate, but change T/Inhale
                    settings.TI = this.computeTInhale(settings.RR, settings.IE);
                    this.dirtySettings.TI = settings.TI;

                    this.setState({
                        maxTInhale: Math.min(maximumTInhale, this.computeTInhale(settings.RR, maximumIE)),
                        minTInhale: Math.max(minimumTInhale, this.computeTInhale(settings.RR, minimumIE)),
                    });

                    if (settings.RP + 0.1 >= settings.TI) {
                        settings.RP = settings.TI - 0.1;
                        this.dirtySettings.RP = settings.RP;
                    }

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

                    if (settings.RP + 0.1 >= settings.TI) {
                        settings.RP = settings.TI - 0.1;
                        this.dirtySettings.RP = settings.RP;
                    }

                    // recalculte the IE in any case, know that we know that the TI is kept with range, this also clears rounding errors
                    settings.IE = this.computeIE(settings.RR, settings.TI);
                    this.dirtySettings.IE = settings.IE;
                } else if (key === 'PP') {
                    const oldValue = this.state.settings.PP;

                    settings.TP += setting - oldValue;
                    this.dirtySettings.TP = settings.TP;
                }

                await this.setStateAsync({
                    settings,
                    hasDirtySettings: true,
                });
            },
        };
    }

    setStateAsync(state) {
        return new Promise((resolve) => {
            this.setState(state, resolve);
        });
    }

    computeTInhale(respiratoryRate, IE) {
        return (60 / parseFloat(respiratoryRate) * parseFloat(IE));
    }

    computeIE(respiratoryRate, TInhale) {
        return ((parseFloat(TInhale) * parseFloat(respiratoryRate)) / 60);
    }

    toggleMode(isVolume) {
        if (isVolume) {
            this.state.updateSetting('MODE', 1);
        } else {
            this.state.updateSetting('MODE', 0);
        }
    }

    async toggleVolumeLimitingEnabled(volumeLimitingEnabled) {
        if (!volumeLimitingEnabled) {
            await this.state.updateSetting('VT', 10000);
            await this.state.updateSetting('ADVT', 9800);
        } else {
            await this.state.updateSetting('VT', 250);
            await this.state.updateSetting('ADVT', 200);
        }
    }

    async updateMinimumADTV(key, setting) {
        await this.state.updateSetting(key, 10000 - setting);
    }

    processIncomingPoints(newPoints) {
        newPoints.forEach((newPoint) => {
            const localTime = new Date(newPoint.loggedAt).getTime() - serverTimeCorrection;

            this.rawMeasurementsValues.push({
                loggedAt: localTime,
                x: localTime - this.currentGraphTime,
                flowy: newPoint.value.flow,
                triggery: newPoint.value.trigger,
                pressurey: newPoint.value.pressure,
                fiO2: newPoint.value.fiO2,
                fiO2i: newPoint.value.fiO2i,
                fiO2e: newPoint.value.fiO2e,
                targetpressurey: newPoint.value.targetPressure,
                volumey: newPoint.value.volume,
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

        // todo: check whether this is usefull in the first place? They are overwritten by the machine settings anyway
        try {
            const settingsResponse = await fetch(`${getApiUrl()}/api/settings`);
            const settingsData = await settingsResponse.json();

            settingsData.ACTIVE = -6;

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

        this.client.subscribe('/api/measured_values', (newValues) => {
            this.processIncomingPoints(newValues);
        });

        const self = this;
        this.client.subscribe('/api/calculated_values', (newCalculatedValues) => {
            self.calculatedValues = newCalculatedValues;
        });

        this.client.subscribe('/api/settings', (newSettings) => {
            // settings for debug purposes only
            if (newSettings.breathingCycleStart) {
                return;
            }

            if (newSettings.breathingCycleEnd) {
                return;
            }

            if (newSettings.exhaleMoment) {
                return;
            }

            if (newSettings.ACTIVE === 0) {
                self.setState({ showCalibrationDialog: false });
            }

            const oldSetttings = { ...self.state.settings };
            // update the t-inhale value
            if (newSettings.RR || newSettings.IE) {
                newSettings.TI = this.computeTInhale(oldSetttings.RR, oldSetttings.IE);
            }

            self.setState({
                settings: { ...oldSetttings, ...newSettings },
            });
        });

        this.animationInterval = setInterval(() => {
            const now = new Date().getTime();

            var cutoffTime = new Date().getTime() - this.state.xLengthMs - serverTimeCorrection;

            // shift old values
            let removeSplicePoint = 0;
            for (let i = 0; i < this.rawMeasurementsValues.length; i++) {
                if (this.rawMeasurementsValues[i].loggedAt > cutoffTime + 200) {
                    removeSplicePoint = i;
                    break;
                }
            }

            if (removeSplicePoint > 0) {
                this.rawMeasurementsValues.splice(0, removeSplicePoint);
            }

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

            this.rawMeasurementsValues.forEach((point) => {
                if (point.loggedAt >= this.currentGraphTime) {
                    if (point.x >= 0 && point.x < this.state.xLengthMs) {
                        newPressureValues.push({
                            y: point.pressurey / integerPrecision,
                            x: point.x / 1000,
                        });

                        if (debugBreathingCycle) {
                            newTargetPressureValues.push({
                                y: point.targetpressurey / integerPrecision,
                                x: point.x / 1000,
                            });
                        }

                        newVolumeValues.push({
                            y: point.volumey / integerPrecision,
                            x: point.x / 1000.0,
                        });

                        newTriggerValues.push({
                            y: point.triggery * 40,
                            x: point.x / 1000.0,
                        });

                        newFlowValues.push({
                            y: point.flowy,
                            x: point.x / 1000.0,
                        });
                    }
                } else {
                    if (point.x >= 0 && point.x < this.state.xLengthMs) {
                        oldPressureValues.push({
                            y: point.pressurey / integerPrecision,
                            x: point.x / 1000,
                        });

                        if (debugBreathingCycle) {
                            oldTargetPressureValues.push({
                                y: point.targetpressurey / integerPrecision,
                                x: point.x / 1000,
                            });
                        }

                        oldVolumeValues.push({
                            y: point.volumey / integerPrecision,
                            x: point.x / 1000,
                        });

                        oldTriggerValues.push({
                            y: point.triggery * 40,
                            x: point.x / 1000,
                        });

                        oldFlowValues.push({
                            y: point.flowy / integerPrecision,
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
            if ((this.state.settings.MODE & 1) === 0) {
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
                muteCountDown: 60 - Math.min(60, Math.floor((now - this.mutedAt.getTime()) / 1000)),
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
                currentValues: {
                    bpmValue: 0,
                    fiO2Value: self.rawMeasurementsValues.length === 0 ? 0.2 : self.rawMeasurementsValues[self.rawMeasurementsValues.length - 1].fiO2,
                    fiO2InhaleValue: self.rawMeasurementsValues.length === 0 ? 0.2 : self.rawMeasurementsValues[self.rawMeasurementsValues.length - 1].fiO2i,
                    fiO2ExhaleValue: self.rawMeasurementsValues.length === 0 ? 0.2 : self.rawMeasurementsValues[self.rawMeasurementsValues.length - 1].fiO2e,
                    pressure: newPressureValues.length > 0 ? newPressureValues[newPressureValues.length - 1].y : 0.0,
                    volume: newVolumeValues.length > 0 ? newVolumeValues[newVolumeValues.length - 1].y : 0.0,
                },
            });
        }, refreshRate);

        MessagingCenter.subscribe('ShowAlarmSettings', this.alarmsShowSubscription.bind(this));
        MessagingCenter.subscribe('ShowSettings', this.settingsShowSubscription.bind(this));
    }

    alarmsShowSubscription(show) {
        this.setState({
            showAlarmSettings: show,
            showSettings: false,
        });
    }

    settingsShowSubscription(show) {
        this.setState({
            showSettings: show,
            showAlarmSettings: false,
        });
    }

    showSettings(currentSettingsState) {
        MessagingCenter.send('ShowSettings', !currentSettingsState);
    }

    async componentWillUnmount() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
        }

        MessagingCenter.unsubscribe('ShowAlarmSettings', this.alarmsShowSubscription.bind(this));
        MessagingCenter.unsubscribe('ShowSettings', this.settingsShowSubscription.bind(this));

        try {
            await this.client.disconnect();
        } catch (e) {
            console.log(e);
        }
    }

    askActiveStateChange() {
        console.log('ask to change active state');
        // if we are in active mode, show the dialog box to confirm deactivation
        if (parseInt(this.state.settings.ACTIVE) > 0) {
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

    handleCalibrationDialogClose(ev) {
        this.setState({ showCalibrationDialog: false });
    }

    startCalibrationProcess(ev) {
        this.saveSetting('ACTIVE', -3);
    }

    startFioCalibrationProcess(ev) {
        this.saveSetting('ACTIVE', -1);
    }

    skipFioCalibrationProcess(ev) {
        this.saveSetting('ACTIVE', 0);
        this.setState({ showCalibrationDialog: false });
    }

    startCalibrationSteps(ev) {
        if (this.state.ACTIVE === -3) {
            this.saveSetting('ACTIVE', -4);
        } else if (this.state.ACTIVE === -1) {
            this.saveSetting('ACTIVE', -2);
        } else {
            this.saveSetting('ACTIVE', -4);
        }

        this.setState({ showCalibrationDialog: true });
    }

    endCalibrationSteps(ev) {
        this.setState({ showCalibrationDialog: false });
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
        this.mutedAt = new Date();
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
                    <div className="page-dashboard__timing-info">
                        {new Date().toLocaleTimeString()}
                    </div>
                    <div className="page-dashboard__machine-info">
                        <button className={cx('threed-btn base', 'light-up', { pressed: this.state.showSettings })} onClick={(e) => {
                            this.showSettings(this.state.showSettings);
                            e.preventDefault();
                        }}>
                            <GearIcon size="md" /><span>{ modeToAbbreviation(this.state.settings.MODE) }</span>
                        </button>
                        { this.state.settings.ACTIVE > -1 &&
                            <button className={'threed-btn ' + (parseInt(this.state.settings.ACTIVE) === 3 ? 'danger' : 'success')}
                                onClick={() => this.askActiveStateChange()}>
                                <OnOffIcon size="md" /><span>{parseInt(this.state.settings.ACTIVE) === 3 ? 'Stop' : 'Start'}</span>
                            </button>
                        }

                        { (this.state.settings.ACTIVE < 0 && this.state.settings.ACTIVE > -5) &&
                            <button className={'threed-btn warning'}
                                onClick={() => this.startCalibrationSteps()}>
                                <OnOffIcon size="md" /><span>{'Calibrate'}</span>
                            </button>
                        }

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
                                <button onClick={(ev) => this.handleShutDownDialogClose(ev, false)} className="threed-btn base">
                                    No
                                </button>
                                <button onClick={(ev) => this.handleShutDownDialogClose(ev, true)} className="threed-btn warning" autoFocus>
                                    Yes
                                </button>
                            </DialogActions>
                        </Dialog>

                        <Dialog open={this.state.settings.ACTIVE === -6}
                            className={'center-dialog-text'}
                            aria-labelledby="connection-dialog-title"
                            aria-describedby="connection-dialog-description">
                            <DialogTitle id="connection-dialog-title">{'Waiting for connection'}</DialogTitle>
                            <DialogContent>
                                <DialogContentText id="connection-dialog-description">
                                    <span>Connect the ventilator to the computer using the supplied USB cable.</span>

                                    <div><img src="/loader.gif" /></div>
                                </DialogContentText>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={this.state.settings.ACTIVE === -5}
                            className={'center-dialog-text'}
                            aria-labelledby="init-error-dialog-title"
                            aria-describedby="init-error-dialog-description">
                            <DialogTitle id="init-error-dialog-title">{'Error during initialization'}</DialogTitle>
                            <DialogContent>
                                <DialogContentText id="init-error-dialog-description">
                                    <span>There was an error during the initialization phase of the ventilator. Please try rebooting the ventilator.</span>
                                </DialogContentText>
                            </DialogContent>
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
                                <button onClick={(ev) => this.handleBeepHeardClose(ev, false)} className="threed-btn base">
                                    No
                                </button>
                                <button onClick={(ev) => this.handleBeepHeardClose(ev, true)} className="threed-btn success" autoFocus>
                                    Yes
                                </button>
                            </DialogActions>
                        </Dialog>

                        <Dialog open={this.state.showCalibrationDialog}
                            className={'calibration-dialog'}
                            onClose={(ev) => this.handleCalibrationDialogClose(ev, false)}
                            aria-labelledby="calibration-dialog-title"
                            aria-describedby="calibration-dialog-description">
                            <DialogTitle id="calibration-dialog-title">{'Perform calibration steps'}</DialogTitle>
                            <DialogContent>
                                <DialogContentText id="alert-dialog-description">
                                    { (this.state.settings.ACTIVE === -4 || this.state.settings.ACTIVE === -3) &&
                                        <span>We will now run through the calibration of the machine, this might take a few moments.</span>
                                    }

                                    { (this.state.settings.ACTIVE === -2 || this.state.settings.ACTIVE === -1) &&
                                        <span>Do you want to start the machine with oxygen support? Click yes to calibrate the necessary sensors. This process might take a few moments to complete</span>
                                    }

                                    { (this.state.settings.ACTIVE === -3 || this.state.settings.ACTIVE === -1) &&
                                        <div className={'center'}><img src="/loader.gif" /></div>
                                    }
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <button onClick={(ev) => this.handleCalibrationDialogClose(ev)} className="threed-btn base">
                                    Cancel
                                </button>
                                { this.state.settings.ACTIVE === -4 &&
                                    <button onClick={(ev) => this.startCalibrationProcess(ev)} className="threed-btn success" autoFocus>
                                        Start
                                    </button>
                                }

                                { this.state.settings.ACTIVE === -2 &&
                                    [
                                        <button onClick={(ev) => this.skipFioCalibrationProcess(ev)} className="threed-btn success" autoFocus>
                                            Without O2
                                        </button>,
                                        <button onClick={(ev) => this.startFioCalibrationProcess(ev)} className="threed-btn success" autoFocus>
                                            With O2
                                        </button>,
                                    ]
                                }
                            </DialogActions>
                        </Dialog>

                    </div>
                </div>

                <div className="page-dashboard__layout">
                    <div className="page-dashboard__layout__body">
                        <div className={cx('page-dashboard__layout__body__full-settings', { 'popped-out': this.state.showSettings })}>
                            <Settings
                                settings={this.state.settings}
                                updateSetting={this.state.updateSetting}
                                minTInhale={this.state.minTInhale}
                                maxTInhale={this.state.maxTInhale}
                                maxPSupport={this.state.maxPSupport}
                                hasDirtySettings={this.state.hasDirtySettings}
                                saveSettings={this.saveSettings.bind(this)}>
                            </Settings>
                        </div>
                        <div className={cx('page-dashboard__layout__body__full-settings', { 'popped-out': this.state.showAlarmSettings })}>
                            <Alarms
                                settings={this.state.settings}
                                updateSetting={this.state.updateSetting}
                                minTInhale={this.state.minTInhale}
                                maxTInhale={this.state.maxTInhale}
                                maxPSupport={this.state.maxPSupport}
                                hasDirtySettings={this.state.hasDirtySettings}
                                saveSettings={this.saveSettings.bind(this)}>
                            </Alarms>
                        </div>
                        <div className="page-dashboard__layout__body__measurements">
                            <div className="page-dashboard__layout__body__measurements__settings">
                                <div>
                                    <SingleValueDisplaySettingsOnly>
                                        <div>
                                            <SingleValueDisplaySettings
                                                name="Peak pressure"
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
                                                name="PEEP"
                                                value={this.state.settings.PP}
                                                settingKey={'PP'}
                                                unit="cmH2O"
                                                decimal={false}
                                                step={5}
                                                minValue={0}
                                                maxValue={20}
                                                updateValue={this.state.updateSetting}
                                            />
                                            <SingleValueDisplaySettings
                                                name="RR"
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
                                                decimal={1}
                                                options={[
                                                    0.200,
                                                    0.222,
                                                    0.250,
                                                    0.285,
                                                    0.333,
                                                    0.400,
                                                    0.500,
                                                ]}
                                                minValue={minimumIE}
                                                maxValue={maximumIE}
                                                updateValue={this.state.updateSetting}
                                                reverseButtons={true}
                                            />
                                        </div>
                                    </SingleValueDisplaySettingsOnly>

                                    <button className={'threed-btn save-button success'}
                                        onClick={(e) => this.saveSettings(e)}
                                        disabled={!this.state.hasDirtySettings}>
                                        <SaveIcon></SaveIcon><span>Confirm</span>
                                    </button>
                                </div>
                            </div>
                            <div className="page-dashboard__layout__body__measurements__graphs">
                                <div className="page-dashboard__layout__body__measurements__graphs__alarm-bar">
                                    <form className="form form--horizontal-xs">
                                        <div className="form__group form__group--shrink">
                                            <div className={cx('option-toggle',
                                                'threed-btn',
                                                'offset-effect-x',
                                                {
                                                    pressed: parseInt(this.state.settings.MT) === 1,
                                                    danger: parseInt(this.state.settings.MT) === 0,
                                                    disabled: parseInt(this.state.settings.MT) === 1,
                                                })}>
                                                <input type="checkbox" id="alarm" checked={parseInt(this.state.settings.MT) === 0} onChange={(e) => this.toggleMute(e)} />
                                                <label htmlFor="alarm">
                                                    <BellIcon size="md" />
                                                    {this.state.settings.MT === 0 && 'MUTE'}
                                                    {this.state.settings.MT === 1 && 'MUTED FOR ' + this.state.muteCountDown + 's'}
                                                </label>
                                            </div>
                                        </div>
                                    </form>
                                    <AlarmOverview></AlarmOverview>
                                </div>
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
                                            thresholdLow={this.state.settings.LPK}
                                            thresholdHigh={this.state.settings.HPK} />
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
                                            peak={modeToBooleans(this.state.settings.MODE).isVolumeLimited ? this.state.settings.VT : null}
                                            thresholdLow={modeToBooleans(this.state.settings.MODE).isVolumeLimited ? this.state.settings.VT - this.state.settings.ADVT : this.state.settings.ADVT}
                                            thresholdHigh={modeToBooleans(this.state.settings.MODE).isVolumeLimited ? this.state.settings.VT + this.state.settings.ADVT : null} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="page-dashboard__layout__sidebar">
                        <CurrentValues calculatedValues={this.state.calculatedValues}
                            currentValues={this.state.currentValues} />
                    </div>
                </div>
            </div>
        );
    }
};
