import React from 'react';
import cx from 'classnames';
import Link from 'next/link';
import GearIcon from 'ventilator-lungs-ui/components/icons/gear';
import PersonIcon from 'ventilator-lungs-ui/components/icons/person';
import { useRouter } from 'next/router';

const MainSidebar = ({ className, ...other }) => {
    const { pathname: currentPath } = useRouter();

    const menuItems = [
        { path: '/', label: 'Patients', icon: <PersonIcon /> },
        { path: '/settings', label: 'Settings', icon: <GearIcon /> },
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
