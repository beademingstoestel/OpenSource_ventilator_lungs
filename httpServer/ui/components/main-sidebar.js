import React, { useState, useEffect, useRef } from 'react';
import cx from 'classnames';
import Link from 'next/link';
import GaugeIcon from './icons/gauge';
import TerminalIcon from './icons/terminal';
import GearIcon from './icons/gear';
import PersonIcon from './icons/person';
import { useRouter } from 'next/router';
import NetworkIcon from './icons/network';

import { getApiUrl, getWsUrl } from '../helpers/api-urls';
import { Client } from '@hapi/nes/lib/client';
import HistoryIcon from './icons/history';
import { createEmitAndSemanticDiagnosticsBuilderProgram } from 'typescript';
import { AlarmBitDefinitions } from '../helpers/alarm-definitions';

const MainSidebar = ({ className, ...other }) => {
    const { pathname: currentPath } = useRouter();

    const currentAlarmsRef = useRef([]);
    const [currentAlarms, setCurrentAlarms] = useState([]);

    async function resetAlarm(e) {
        try {
            const tosend = {};
            tosend.RA = 1;

            // returncomplete also makes sure the python code and controller only receive the changed values
            await fetch(`${getApiUrl()}/api/settings?returncomplete=false`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(tosend),
            });

            setCurrentAlarms([]);
        } catch (e) {
            // todo: show error to the user
            console.log(e);
        }
    }

    function getAlarmTexts(alarmValue, type) {
        const messages = [];

        let shiftAlarm = alarmValue;

        for (let i = 0; i < 32; i++) {
            if ((shiftAlarm & 1) > 0 && AlarmBitDefinitions[i].ignore !== true) {
                const message = type === 'raised' ? AlarmBitDefinitions[i].message : AlarmBitDefinitions[i].positiveMessage;

                messages.push(<li className={'main-sidebar__alert__entry__values__alarm ' + type}>{message}</li>);
            }

            shiftAlarm = shiftAlarm >> 1;
        }

        return messages;
    }

    function addAlarm(newAlarm) {
        const allAlarms = [...currentAlarmsRef.current];
        allAlarms.unshift(newAlarm);
        setCurrentAlarms(allAlarms);
        console.log(allAlarms);
    }

    useEffect(() => {
        currentAlarmsRef.current = currentAlarms;
    }, [currentAlarms]);

    useEffect(() => {
        const client = new Client(`${getWsUrl()}`);
        let isConnected = false;

        client.onConnect = () => { isConnected = true; };

        const subscribeAlarm = async () => {
            // get the historical alarms
            await client.connect();

            try {
                const alarms = await client.request('/api/alarms?since=0');

                console.log(alarms);

                if (alarms && alarms.statusCode === 200) {
                    setCurrentAlarms(alarms.payload);
                }
            } catch (e) {
                console.log(e);
            }

            client.subscribe('/api/alarms', (alarm) => {
                addAlarm(alarm);
            });
        };

        subscribeAlarm();

        return function cleanUp() {
            try {
                if (isConnected) {
                    client.disconnect();
                }
            } catch (exception) { console.log(exception); }
        };
    }, []);

    const menuItems = [
        { path: '/', label: 'Dashboard', icon: <GaugeIcon /> },
        { path: '/patient-information', label: 'Patient information', icon: <PersonIcon /> },
        { path: '/history', label: 'History', icon: <HistoryIcon viewboxWidth={1024} viewboxHeight={1024} /> },
        { path: '/network-settings', label: 'Network settings', icon: <NetworkIcon /> },
        { path: '/logs', label: 'System logs', icon: <TerminalIcon /> },
    ];

    return (
        <nav className={cx('main-sidebar', className)} {...other}>
            {currentAlarms.length > 0 &&
                <div className="main-sidebar__alert alert alert--danger">
                    <button onClick={(e) => resetAlarm(e)}>Reset alarm</button>
                    {currentAlarms.map(currentAlarm => {
                        return (<div className="main-sidebar__alert__entry">
                            <div className="main-sidebar__alert__entry__date">
                                {new Date(currentAlarm.loggedAt).toLocaleTimeString()}
                            </div>
                            <ul className="main-sidebar__alert__entry__values">
                                {getAlarmTexts(currentAlarm.data.resolvedAlarms, 'resolved')}
                                {getAlarmTexts(currentAlarm.data.raisedAlarms, 'raised')}
                            </ul>
                        </div>);
                    })}
                </div>
            }
            <ul className="main-sidebar__menu">
                {
                    menuItems.map(({ path, label, icon }, index) => {
                        return (
                            <li className={cx('main-sidebar__menu-item', { 'is-active': currentPath === path })} key={index}>
                                <Link href={path}>
                                    <a className="main-sidebar__link">
                                        {icon} <span className="u-d-none-xs u-d-inline-xxl">{label}</span>
                                    </a>
                                </Link>
                            </li>
                        );
                    })
                }
            </ul>
        </nav>
    );
};

export default MainSidebar;
