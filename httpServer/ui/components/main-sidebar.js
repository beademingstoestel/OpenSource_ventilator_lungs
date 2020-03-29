import React from 'react';
import cx from 'classnames';
import Link from 'next/link';
import GaugeIcon from './icons/gauge';
import TerminalIcon from './icons/terminal';
import GearIcon from './icons/gear';
import PersonIcon from './icons/person';
import { useRouter } from 'next/router';
import NetworkIcon from './icons/network';

const MainSidebar = ({ className, ...other }) => {
    const { pathname: currentPath } = useRouter();

    const menuItems = [
        { path: '/', label: 'Dashboard', icon: <GaugeIcon /> },
        { path: '/patient-information', label: 'Patient information', icon: <PersonIcon /> },
        { path: '/network-settings', label: 'Network settings', icon: <NetworkIcon /> },
        { path: '/logs', label: 'System logs', icon: <TerminalIcon /> },
    ];

    return (
        <nav className={cx('main-sidebar', className)} {...other}>
            <ul className="main-sidebar__menu">
                {
                    menuItems.map(({ path, label, icon }, index) => {
                        return (
                            <li className={ cx('main-sidebar__menu-item', { 'is-active': currentPath === path }) } key={ index }>
                                <Link href={ path }>
                                    <a className="main-sidebar__link">
                                        { icon } <span className="u-d-none-xs u-d-inline-xxl">{ label }</span>
                                    </a>
                                </Link>
                            </li>
                        )
                    })
                }
            </ul>
        </nav>
    );
};

export default MainSidebar;
