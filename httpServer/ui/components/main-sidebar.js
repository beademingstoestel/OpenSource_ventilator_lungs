import React from 'react';
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

const MainSidebar = ({ className, ...other }) => {
    const { pathname: currentPath } = useRouter();

    const menuItems = [
        { path: '/', label: 'Dashboard', icon: <GraphIcon /> },
        { path: '/patient-information', label: 'Patient', icon: <PersonIcon /> },
        { path: '/history', label: 'History', icon: <HistoryIcon viewboxWidth={1024} viewboxHeight={1024} /> },
        { path: '/network-settings', label: 'Network', icon: <NetworkIcon /> },
        { path: '/logs', label: 'Logs', icon: <TerminalIcon /> },
    ];

    const settingsMenuItems = [
        { label: 'Alarms', icon: <BellIcon />, isActive: false },
        { label: 'Settings', icon: <GearIcon />, isActive: false },
    ];

    return (
        <nav className={cx('main-sidebar', className)} {...other}>
            {currentPath === '/' &&
                <ul className="main-sidebar__menu main-sidebar__settings-menu">
                    {
                        settingsMenuItems.map(({ label, icon, isActive }, index) => {
                            return (
                                <li className={cx('main-sidebar__menu-item', { 'is-active': isActive })} key={index}>
                                    <Link href={'#'}>
                                        <a className={cx('main-sidebar__menu-item__link', 'threed-btn', 'base', { pressed: false })}>
                                            {icon} <span className="u-d-none-xs u-d-inline-xxl">{label}</span>
                                        </a>
                                    </Link>
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
                                    <a className={cx('main-sidebar__menu-item__link', 'threed-btn', 'base', { pressed: currentPath === path })}>
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
