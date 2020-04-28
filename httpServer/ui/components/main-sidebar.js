import React, { useState, useEffect } from 'react';
import cx from 'classnames';
import Link from 'next/link';
import GaugeIcon from './icons/gauge';
import TerminalIcon from './icons/terminal';
import GearIcon from './icons/gear';
import BellIcon from './icons/bell';
import PersonIcon from './icons/person';
import GraphIcon from './icons/graph';
import { useRouter } from 'next/router';
import NetworkIcon from './icons/network';

import HistoryIcon from './icons/history';

import MessagingCenter from '../helpers/messaging';

const MainSidebar = ({ className, ...other }) => {
    const { pathname: currentPath } = useRouter();

    const [alarmsSelected, setAlarmsSelected] = useState(false);
    const [settingsSelected, setSettingsSelected] = useState(false);

    const menuItems = [
        { path: '/', label: 'Dashboard', icon: <GraphIcon /> },
        { path: '/patient-information', label: 'Patient', icon: <PersonIcon /> },
        { path: '/history', label: 'History', icon: <HistoryIcon viewboxWidth={1024} viewboxHeight={1024} /> },
        { path: '/network-settings', label: 'Network', icon: <NetworkIcon /> },
        { path: '/logs', label: 'Logs', icon: <TerminalIcon /> },
    ];

    useEffect(() => {
        const alarmsShowSubscription = (show) => {
            setAlarmsSelected(show);
            setSettingsSelected(false);
        };

        const settingsShowSubscription = (show) => {
            setAlarmsSelected(false);
            setSettingsSelected(show);
        };

        MessagingCenter.subscribe('ShowAlarmSettings', alarmsShowSubscription);
        MessagingCenter.subscribe('ShowSettings', settingsShowSubscription);

        return () => {
            MessagingCenter.unsubscribe('ShowAlarmSettings', alarmsShowSubscription);
            MessagingCenter.unsubscribe('ShowSettings', settingsShowSubscription);
        };
    });

    function toggleButton(label, currentValue) {
        if (label === 'Alarms') {
            MessagingCenter.send('ShowAlarmSettings', !currentValue);
        } else {
            MessagingCenter.send('ShowSettings', !currentValue);
        }
    }

    function hideSettingsAndAlarms() {
        MessagingCenter.send('ShowAlarmSettings', false);
        MessagingCenter.send('ShowSettings', false);
    }

    const settingsMenuItems = [
        { label: 'Alarms', icon: <BellIcon />, isActive: alarmsSelected, click: toggleButton },
        { label: 'Settings', icon: <GearIcon />, isActive: settingsSelected, click: toggleButton },
    ];

    return (
        <nav className={cx('main-sidebar', className)} {...other}>
            {currentPath === '/' &&
                <ul className="main-sidebar__menu main-sidebar__settings-menu">
                    {
                        settingsMenuItems.map(({ label, icon, isActive, click }, index) => {
                            return (
                                <li className={cx('main-sidebar__menu-item', { 'is-active': isActive })} key={index}>
                                    <a className={cx('main-sidebar__menu-item__link', 'threed-btn', 'light-up', 'base', { pressed: isActive })} href="#" onClick={(e) => { e.preventDefault(); click(label, isActive); }}>
                                        {icon} <span className="u-d-none-xs u-d-inline-xxl">{label}</span>
                                    </a>
                                </li>
                            );
                        })
                    }
                </ul>
            }
            <ul className="main-sidebar__menu">
                {
                    menuItems.map(({ path, label, icon }, index) => {
                        return (
                            <li className={cx('main-sidebar__menu-item', { 'is-active': currentPath === path })} key={index}>
                                <Link href={path}>
                                    <a className={cx('main-sidebar__menu-item__link', 'threed-btn', 'light-up', 'base', { pressed: currentPath === path })}
                                        onClick={() => hideSettingsAndAlarms()}>
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
