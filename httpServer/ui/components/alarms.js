import React, { useState, useEffect, useRef } from 'react';
import cx from 'classnames';

import dynamic from 'next/dynamic';
import { Switch, OptionSwitch } from '../components/switch';
import SaveIcon from './icons/save';
import { modeToAbbreviation, modeToString, modeToBooleans, booleansToMode } from '../helpers/modes';
import MessagingCenter from '../helpers/messaging';

// eslint-disable-next-line no-unused-vars
const SingleValueDisplay = dynamic(() => import('../components/single-value-display').then(mod => mod.SingleValueDisplay), { ssr: false });

// eslint-disable-next-line no-unused-vars
const SingleValueDisplaySettings = dynamic(() => import('../components/single-value-display').then(mod => mod.SingleValueDisplaySettings), { ssr: false });

// eslint-disable-next-line no-unused-vars
const SingleValueDisplaySettingsOnly = dynamic(() => import('../components/single-value-display').then(mod => mod.SingleValueDisplaySettingsOnly), { ssr: false });

const Alarms = ({
    settings = {},
    updateSetting,
    minTInhale,
    maxTInhale,
    maxPSupport,
    hasDirtySettings,
    saveSettings,
}) => {
    const [selectedModeSettings, setSelectedModeSettings] = useState(modeToBooleans(settings.MODE));

    useEffect(() => {
        setSelectedModeSettings(modeToBooleans(settings.MODE));
    }, [settings]);

    return (
        <div className="settings">
            <div className="mode-select">
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
            <div>
                <SingleValueDisplaySettingsOnly>
                    <SingleValueDisplaySettings
                        name="Upper limit PK"
                        value={settings.HPK}
                        unit="cmH2O"
                        settingKey={'HPK'}
                        decimal={false}
                        step={1}
                        minValue={settings.PK + 5}
                        maxValue={90}
                        updateValue={updateSetting}
                    />
                    <SingleValueDisplaySettings
                        name="Alarm limits PEEP"
                        value={settings.ADPP}
                        settingKey={'ADPP'}
                        unit="cmH2O"
                        decimal={false}
                        step={1}
                        minValue={0}
                        maxValue={100}
                        updateValue={updateSetting}
                    />
                    <SingleValueDisplaySettings
                        name={selectedModeSettings.isVolumeLimited ? 'Alarm limits TV' : 'Minimum volume'}
                        value={settings.ADVT}
                        settingKey={'ADVT'}
                        unit="mL"
                        step={10}
                        minValue={0}
                        maxValue={800}
                        decimal={false}
                        updateValue={updateSetting}
                    />
                    <SingleValueDisplaySettings
                        name="Lower limit PK"
                        value={settings.LPK}
                        unit="cmH2O"
                        settingKey={'LPK'}
                        decimal={false}
                        step={1}
                        minValue={0}
                        maxValue={settings.PK - 5}
                        updateValue={updateSetting}
                    />
                    <SingleValueDisplaySettings
                        name="Alarm limits FiO2"
                        value={settings.ADFIO2}
                        settingKey={'ADFIO2'}
                        displayFunction={(value, decimal) => (value * 100).toFixed(0) + '%'}
                        unit="%oxygen"
                        decimal={2}
                        step={0.1}
                        minValue={0.1}
                        maxValue={0.5}
                        updateValue={updateSetting}
                    />
                    <SingleValueDisplaySettings
                        name="Hyperventilation limit"
                        value={settings.HRR}
                        settingKey={'HRR'}
                        unit="bpm"
                        decimal={false}
                        step={1}
                        minValue={settings.RR}
                        maxValue={60}
                        updateValue={updateSetting}
                    />
                </SingleValueDisplaySettingsOnly>
            </div>
        </div>);
};

export default Alarms;
