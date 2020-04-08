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

const MainSidebar = ({ className, ...other }) => {
    const { pathname: currentPath } = useRouter();

    const [currentAlarm, setCurrentAlarm] = useState(0);

    function getAlarmTexts(alarmValue) {
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

    useEffect(() => {
        const subscribeAlarm = async () => {
            const client = new Client(`${getWsUrl()}`);
            await client.connect();

            client.subscribe('/api/alarms', (alarm) => {
                setCurrentAlarm(parseInt(alarm.value));
            });
        };

        subscribeAlarm();
    }, []);

    const menuItems = [
        { path: '/', label: 'Dashboard', icon: <GaugeIcon /> },
        { path: '/patient-information', label: 'Patient information', icon: <PersonIcon /> },
        { path: '/network-settings', label: 'Network settings', icon: <NetworkIcon /> },
        { path: '/logs', label: 'System logs', icon: <TerminalIcon /> },
    ];

    return (
        <nav className={cx('main-sidebar', className)} {...other}>
            {parseInt(currentAlarm) > 0 &&
                <div className="main-sidebar__alert alert alert--danger">
                    {getAlarmTexts(currentAlarm)}
                    <button>Reset alarm</button>
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
