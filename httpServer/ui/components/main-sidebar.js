import React, { useState, useEffect } from 'react';
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

const MainSidebar = ({ className, ...other }) => {
    const { pathname: currentPath } = useRouter();

    const [currentAlarm, setCurrentAlarm] = useState(0);

    async function resetAlarm(e) {
        try {
            const tosend = {};
            tosend['RA'] = 1;

            // returncomplete also makes sure the python code and controller only receive the changed values
            await fetch(`${getApiUrl()}/api/settings?returncomplete=false`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(tosend),
            });
        } catch (e) {
            // todo: show error to the user
            console.log(e);
        }
    }

    function getAlarmTexts(alarmValue) {
        const alarmTexts = {
            0: { message: 'BPM too low' },
            1: { message: 'Alarm not defined' },
            2: { message: 'Alarm not defined' },
            3: { message: 'Alarm not defined' },
            4: { message: 'Peep not within thresholds' },
            5: { message: 'Pressure not within thresholds' },
            6: { message: 'Volume not within thresholds' },
            7: { message: 'Residual volume is not zero' },
            8: { message: 'Arduino not found' },
            9: { message: 'Alarm not defined' },
            10: { message: 'Alarm not defined' },
            11: { message: 'Alarm not defined' },
            12: { message: 'Alarm not defined' },
            13: { message: 'Alarm not defined' },
            14: { message: 'Alarm not defined' },
            15: { message: 'Alarm not defined' },
            16: { message: 'Alarm not defined' },
            17: { message: 'Pressure not within thresholds (arduino)', redundantWith: 5 },
            18: { message: 'Volume not within thresholds (arduino)', redundantWith: 6, ignore: true },
            19: { message: 'Peep not within thresholds (arduino)', ignore: true },
            20: { message: 'Pressure sensor error' },
            21: { message: 'Machine is overheating' },
            22: { message: 'Flow sensor error' },
            23: { message: 'Pressure sensor calibration failed' },
            24: { message: 'Flow sensor calibration failed' },
            25: { message: 'Limit switch sensor error' },
            26: { message: 'HALL sensor error' },
            27: { message: 'No external power, switch to battery' },
            28: { message: 'Battery low' },
            29: { message: 'Battery critical' },
            30: { message: 'Fan not operational' },
            31: { message: 'GUI not found' },
        };

        const messages = [];

        let shiftAlarm = alarmValue;

        for (let i = 0; i < 32; i++) {
            if ((shiftAlarm & 1) > 0 && alarmTexts[i].ignore !== true) {
                messages.push(<div>{alarmTexts[i].message}</div>);
            }

            shiftAlarm = shiftAlarm >> 1;
        }

        return messages;
    }

    useEffect(() => {
        const client = new Client(`${getWsUrl()}`);
        const subscribeAlarm = async () => {
            await client.connect();

            client.subscribe('/api/alarms', (alarm) => {
                setCurrentAlarm(parseInt(alarm.value));
            });
        };

        subscribeAlarm();

        return function cleanUp() {
            try {
                client.disconnect();
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
            {parseInt(currentAlarm) > 0 &&
                <div className="main-sidebar__alert alert alert--danger">
                    <button onClick={(e) => resetAlarm(e)}>Reset alarm</button>
                    {getAlarmTexts(currentAlarm)}
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
