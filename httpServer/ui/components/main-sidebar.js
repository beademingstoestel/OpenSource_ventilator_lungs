import React from 'react';
import cx from 'classnames';
import Link from 'next/link';
import GaugeIcon from './icons/gauge';
import TerminalIcon from './icons/terminal';
import GearIcon from './icons/gear';
import PersonIcon from './icons/person';
import { useRouter } from 'next/router';

const MainSidebar = ({ className, ...other }) => {
    const { pathname: currentPath } = useRouter();

    const menuItems = [
        { path: '/', label: 'Dashboard', icon: <GaugeIcon /> },
        { path: '/machines-profile', label: 'Machines profile', icon: <PersonIcon /> },
        { path: '/thresholds', label: 'Thresholds', icon: <GearIcon /> },
        { path: '/login', label: 'Log in', icon: <PersonIcon /> },
        { path: '/logs', label: 'System logs', icon: <TerminalIcon /> },
    ];

    return (
        <nav className={ cx('main-sidebar', className) } { ...other }>
            Logo

            <ul className="main-sidebar__menu">
                {
                    menuItems.map(({ path, label, icon }, index) => {
                        return (
                            <li className={ cx('main-sidebar__menu-item', { 'is-active': currentPath === path }) } key={ index }>
                                <Link href={ path }>
                                    <a className="main-sidebar__link">
                                        { icon } <span className="u-d-none-xs u-d-inline-lg">{ label }</span>
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
