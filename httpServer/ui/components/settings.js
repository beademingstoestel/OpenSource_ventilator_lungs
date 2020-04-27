import React, { useState, useEffect, useRef } from 'react';
import cx from 'classnames';

import dynamic from 'next/dynamic';
import { Switch, OptionSwitch } from '../components/switch';

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
}) => {
    return (
        <div className="settings">
            <div>
                <SingleValueDisplaySettingsOnly>
                    <div>
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
                            step={5}
                            minValue={0}
                            maxValue={20}
                            updateValue={updateSetting}
                        />
                    </div>
                    <div className={'single-value-display-settings__alarm'}>
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
                    </div>
                </SingleValueDisplaySettingsOnly>
                <div>
                    <SingleValueDisplaySettingsOnly>
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
                            minValue={0.3}
                            maxValue={1.0}
                            updateValue={updateSetting}
                        />
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
                <div>
                    <SingleValueDisplaySettingsOnly>
                        <div>
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
                        </div>
                        <div className={'single-value-display-settings__alarm'}>
                            <SingleValueDisplaySettings
                                name="Alarm limits TV"
                                value={settings.ADVT}
                                settingKey={'ADVT'}
                                unit="mL"
                                step={10}
                                minValue={0}
                                maxValue={200}
                                decimal={false}
                                updateValue={updateSetting}
                            />
                        </div>
                    </SingleValueDisplaySettingsOnly>
                </div>
            </div>
        </div>);
};

export default Settings;
