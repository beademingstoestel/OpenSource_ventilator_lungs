import React, { useState, useEffect, useRef } from 'react';
import cx from 'classnames';

import dynamic from 'next/dynamic';
import { Switch, OptionSwitch } from '../components/switch';
import SaveIcon from './icons/save';
import { modeToBooleans, booleansToMode } from '../helpers/modes';
import MessagingCenter from '../helpers/messaging';

// eslint-disable-next-line no-unused-vars
const SingleValueDisplay = dynamic(() => import('../components/single-value-display').then(mod => mod.SingleValueDisplay), { ssr: false });

// eslint-disable-next-line no-unused-vars
const SingleValueDisplaySettings = dynamic(() => import('../components/single-value-display').then(mod => mod.SingleValueDisplaySettings), { ssr: false });

// eslint-disable-next-line no-unused-vars
const SingleValueDisplaySettingsOnly = dynamic(() => import('../components/single-value-display').then(mod => mod.SingleValueDisplaySettingsOnly), { ssr: false });

const minimumIE = 0.20;
const maximumIE = 0.80;

const Settings = ({
    settings = {},
    updateSetting,
    minTInhale,
    maxTInhale,
    maxPSupport,
    hasDirtySettings,
    saveSettings,
}) => {
    const [selectedModeSettings, setSelectedModeSettings] = useState(modeToBooleans(settings.MODE));

    function setMode(isFlowTriggered, isPatientTriggered, isVolumeLimited) {
        const newMode = booleansToMode(isFlowTriggered, isPatientTriggered, isVolumeLimited, selectedModeSettings.hasOxygen);
        updateSetting('MODE', newMode);
    }

    useEffect(() => {
        setSelectedModeSettings(modeToBooleans(settings.MODE));
    }, [settings]);

    return (
        <div className="settings">
            <div className="mode-select">
                <div className="threed-btn--horizontal-group">
                    <button className={cx('threed-btn', 'base', 'button-1', 'light-up', { pressed: !selectedModeSettings.isVolumeLimited && !selectedModeSettings.isPatientTriggered })}
                        onClick={() => setMode(selectedModeSettings.isFlowTriggered, false, false)}>
                        PC
                    </button>
                    <button className={cx('threed-btn', 'base', 'button-2', 'light-up', { pressed: !selectedModeSettings.isVolumeLimited && selectedModeSettings.isPatientTriggered })}
                        onClick={() => setMode(selectedModeSettings.isFlowTriggered, true, false)}>
                        SIMV-PC
                    </button>
                    <button className={cx('threed-btn', 'base', 'button-3', 'light-up', { pressed: selectedModeSettings.isVolumeLimited })}
                        onClick={() => setMode(selectedModeSettings.isFlowTriggered, false, true)}>
                        PRVC
                    </button>
                </div>
                {selectedModeSettings.isPatientTriggered &&
                    <div className="threed-btn--horizontal-group">
                        <button className={cx('threed-btn', 'base', 'button-1', 'light-up', { pressed: selectedModeSettings.isFlowTriggered })}
                            onClick={() => setMode(true, true, false)}>
                            flow
                        </button>
                        <button className={cx('threed-btn', 'base', 'button-2', 'light-up', { pressed: !selectedModeSettings.isFlowTriggered })}
                            onClick={() => setMode(false, true, false)}>
                            pressure
                        </button>
                    </div>
                }
                {!hasDirtySettings &&
                    <button className={cx('threed-btn', 'save-button', 'disabled')}
                        onClick={(e) => { MessagingCenter.send('ShowSettings', false); }}>
                        <span>Close</span>
                    </button>
                }
                {hasDirtySettings &&
                    <button className={cx('threed-btn', 'save-button', 'success')}
                        onClick={(e) => { MessagingCenter.send('ShowSettings', false); saveSettings(e); }}
                        disabled={!hasDirtySettings}>
                        <SaveIcon /><span>Confirm</span>
                    </button>
                }
            </div>
            {selectedModeSettings.isPatientTriggered &&
                <div>
                    <SingleValueDisplaySettingsOnly>
                        {selectedModeSettings.isFlowTriggered &&
                            <SingleValueDisplaySettings
                                name="Trigger sens."
                                value={settings.TS}
                                settingKey={'TS'}
                                decimal={2}
                                unit='L/min'
                                step={0.1}
                                minValue={0}
                                maxValue={10}
                                updateValue={updateSetting}
                            />
                        }
                        {!selectedModeSettings.isFlowTriggered &&
                            <SingleValueDisplaySettings
                                name="Trigger sens."
                                value={settings.TP}
                                displayFunction={(value, decimal) => (settings.PP - settings.TP).toFixed(decimal)}
                                reverseButtons={true}
                                settingKey={'TP'}
                                decimal={2}
                                unit='cmH2O'
                                step={0.1}
                                minValue={-20}
                                maxValue={settings.PP}
                                updateValue={updateSetting}
                            />
                        }
                        <SingleValueDisplaySettings
                            name="Psupport"
                            value={settings.PS}
                            settingKey={'PS'}
                            unit="cmH2O"
                            decimal={false}
                            step={1}
                            minValue={10}
                            maxValue={maxPSupport}
                            updateValue={updateSetting}
                        />
                    </SingleValueDisplaySettingsOnly>
                </div>
            }
            {selectedModeSettings.isVolumeLimited &&
                <div>
                    <SingleValueDisplaySettingsOnly>
                        <SingleValueDisplaySettings
                            name="Tidal volume (TV)"
                            value={settings.VT}
                            settingKey={'VT'}
                            unit="mL"
                            step={50}
                            minValue={250}
                            maxValue={800}
                            decimal={false}
                            updateValue={updateSetting}
                        />
                    </SingleValueDisplaySettingsOnly>
                </div>
            }
            <div>
                <SingleValueDisplaySettingsOnly>
                    <SingleValueDisplaySettings
                        name="Peak pressure (PK)"
                        value={settings.PK}
                        unit="cmH2O"
                        settingKey={'PK'}
                        decimal={false}
                        step={1}
                        minValue={10}
                        maxValue={70}
                        warningThreshold={60}
                        updateValue={updateSetting}
                    />
                    <SingleValueDisplaySettings
                        name="PEEP level"
                        value={settings.PP}
                        settingKey={'PP'}
                        unit="cmH2O"
                        decimal={false}
                        step={1}
                        minValue={0}
                        maxValue={20}
                        updateValue={updateSetting}
                    />
                    <SingleValueDisplaySettings
                        name="Set RR value"
                        value={settings.RR}
                        settingKey={'RR'}
                        unit="bpm"
                        step={1}
                        minValue={10}
                        maxValue={35}
                        decimal={false}
                        updateValue={updateSetting}
                    />
                    <SingleValueDisplaySettings
                        name="I/E"
                        value={settings.IE}
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
                        updateValue={updateSetting}
                        reverseButtons={true}
                    />
                    <SingleValueDisplaySettings
                        name="Set T/inhale"
                        value={settings.TI}
                        settingKey={'TI'}
                        unit="sec"
                        decimal={1}
                        step={0.1}
                        minValue={minTInhale}
                        maxValue={maxTInhale}
                        updateValue={updateSetting}
                    />
                    <SingleValueDisplaySettings
                        name="Ramp"
                        value={settings.RP}
                        settingKey={'RP'}
                        unit="sec"
                        decimal={1}
                        step={0.1}
                        minValue={0.0}
                        maxValue={settings.TI - 0.1}
                        updateValue={updateSetting}
                    />
                    <SingleValueDisplaySettings
                        name="FiO2"
                        value={settings.FIO2}
                        settingKey={'FIO2'}
                        displayFunction={(value, decimal) => (value * 100).toFixed(0) + '%'}
                        unit="%oxygen"
                        decimal={2}
                        step={0.1}
                        minValue={0.2}
                        maxValue={1.0}
                        updateValue={updateSetting}
                    />
                </SingleValueDisplaySettingsOnly>
            </div>
        </div>);
};

export default Settings;
