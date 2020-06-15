import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import cx from 'classnames';
import GearIcon from '../components/icons/gear';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

// eslint-disable-next-line no-unused-vars
const SingleValueDisplay = dynamic(() => import('../components/single-value-display').then(mod => mod.SingleValueDisplay), { ssr: false });

Object.filterActiveValues = (obj) =>
    Object.keys(obj)
        .filter(key => obj[key].active)
        .reduce((res, key) => {
            res[key] = obj[key];
            return res;
        }, {});

Object.getNumberOfActiveProperties = (obj) =>
    Object.keys(obj)
        .filter(key => obj[key].active)
        .length;

const possibleValues = {
    pressurePlateau: {
        active: true,
        name: 'Plateau pressure',
        value: 'calculatedValues.pressurePlateau',
        label: 'Pressure<br />Plat',
    },
    respiratoryRate: {
        active: true,
        name: 'Respiratory rate',
        value: 'calculatedValues.respatoryRate',
        label: 'Respiratory<br />rate',
    },
    tidalVolume: {
        active: true,
        name: 'Tidal volume',
        value: 'calculatedValues.tidalVolume',
        label: 'Tidal<br />volume (mL)',
    },
    volumePerMinute: {
        active: true,
        name: 'Delivered volume per minute',
        value: 'calculatedValues.volumePerMinute',
        label: 'Delivered<br />volume (L/min)',
    },
    fiO2: {
        active: true,
        name: 'Current FiO2 value',
        value: 'currentValues.fiO2Value',
        label: 'FiO2',
        displayFunction: (value, decimal) => (value * 100).toFixed(0) + '%',
    },
    fiO2i: {
        active: false,
        name: 'Current FiO2 exh. value',
        value: 'currentValues.fiO2InhaleValue',
        label: 'FiO2<br />exhale',
        displayFunction: (value, decimal) => (value * 100).toFixed(0) + '%',
    },
    fiO2e: {
        active: false,
        name: 'Current FiO2 inh. value',
        value: 'currentValues.fiO2ExhaleValue',
        label: 'FiO2<br />inhale',
        displayFunction: (value, decimal) => (value * 100).toFixed(0) + '%',
    },
    pressure: {
        active: false,
        name: 'Pressure',
        value: 'currentValues.pressure',
        label: 'Pressure (cmH2O)',
    },
    volume: {
        active: false,
        name: 'Volume',
        value: 'currentValues.volume',
        label: 'Volume (ml)',
    },
    bpm: {
        active: false,
        name: 'Breaths per minute',
        value: 'currentValues.bpmValue',
        label: 'BPM',
    },
    lungCompliance: {
        active: false,
        name: 'Lung compliance',
        value: 'calculatedValues.lungCompliance',
        label: 'Lung<br />compliance (ml/cmH2O)',
    },
};

const CurrentValues = ({
    calculatedValues,
    currentValues,
}) => {
    const [settingsShown, setSettingsShown] = useState(false);

    const [selectedValues, setSelectedValues] = useState({});

    const [valuesToShow, setValuesToShow] = useState({});

    useEffect(() => {
        setValuesToShow(Object.filterActiveValues(possibleValues));
    }, []);

    useEffect(() => {
        const newSelectedValues = {};

        Object.getOwnPropertyNames(possibleValues).forEach((key) => {
            newSelectedValues[key] = {
                active: Object.prototype.hasOwnProperty.call(valuesToShow, key),
            };
        });

        setSelectedValues(newSelectedValues);
    }, [valuesToShow]);

    function getValue(evalStr, calculatedValues, currentValues) {
        const parts = evalStr.split('.');

        if (parts[0] === 'calculatedValues') {
            return calculatedValues[parts[1]];
        } else if (parts[0] === 'currentValues') {
            return currentValues[parts[1]];
        }

        return 0.0;
    }

    function showSettings() {
        const newSelectedValues = {};

        Object.getOwnPropertyNames(possibleValues).forEach((key) => {
            newSelectedValues[key] = {
                active: Object.prototype.hasOwnProperty.call(valuesToShow, key),
            };
        });

        setSelectedValues(newSelectedValues);

        setSettingsShown(true);
    }

    function hideSettings() {
        setSettingsShown(false);
    }

    function saveSettings() {
        if (Object.getNumberOfActiveProperties(selectedValues) <= 5) {
            const newValuesToShow = {};
            Object.getOwnPropertyNames(selectedValues).forEach((key) => {
                if (selectedValues[key].active) {
                    newValuesToShow[key] = possibleValues[key];
                }
            });

            setValuesToShow(newValuesToShow);

            setSettingsShown(false);
        }
    }

    function selectValueChanged(key, value) {
        const oldSelectedValues = { ...selectedValues };
        oldSelectedValues[key].active = value;

        setSelectedValues(oldSelectedValues);
    }

    return (
        <div className="current-values">
            <div className="current-values__values">
                {Object.getOwnPropertyNames(valuesToShow).map((property) => {
                    const valueToShow = valuesToShow[property];

                    return (
                        <SingleValueDisplay
                            name={valueToShow.label}
                            value={getValue(valueToShow.value, calculatedValues, currentValues)}
                            decimal={1}
                            status={'normal'}
                            displayFunction={valueToShow.displayFunction}
                        ></SingleValueDisplay>
                    );
                })}
            </div>
            <div className={cx('current-values__settings')}>
            </div>
            <button className={cx('current-values__toggle-button', 'threed-btn', 'base')} onClick={() => showSettings()}>
                <GearIcon></GearIcon>
            </button>

            <Dialog open={settingsShown}
                className="sidebar-settings-dialog"
                onClose={(ev) => hideSettings()}
                aria-labelledby="settings-dialog-title"
                aria-describedby="settings-dialog-description">
                <DialogTitle id="settings-dialog-title">{'Sidebar settings'}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="settings-dialog-description">
                        You can pick a maximum of 5 realtime settings to show in the sidebar.

                        <div className={'settings-picker'}>
                            { Object.getOwnPropertyNames(possibleValues).map((key) => {
                                return (<div key={key}>
                                    <label>
                                        <input type="checkbox" checked={selectedValues[key] && selectedValues[key].active} onChange={(e) => selectValueChanged(key, e.target.checked)} /> { possibleValues[key].name }
                                    </label>
                                </div>);
                            }) }
                        </div>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={(ev) => hideSettings()} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={(ev) => saveSettings()} color="primary" autoFocus>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default CurrentValues;
