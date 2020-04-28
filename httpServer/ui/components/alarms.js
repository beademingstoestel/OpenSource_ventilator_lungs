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
                        name="Alarm limits PK"
                        value={settings.ADPK}
                        unit="cmH2O"
                        settingKey={'ADPK'}
                        decimal={false}
                        step={1}
                        minValue={0}
                        maxValue={35}
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
                        maxValue={200}
                        decimal={false}
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
                </SingleValueDisplaySettingsOnly>
            </div>
        </div>);
};

export default Alarms;
