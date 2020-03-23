import React from 'react';
import cx from 'classnames';
import Link from 'next/link';

const MainSidebar = ({ className, ...other }) => {
    return (
        <nav className={ cx('main-sidebar', className) } { ...other }>
            Logo

            <ul className="main-sidebar__menu">
                <li><Link href="/"><a className="main-sidebar__link">Dashboard</a></Link></li>
                <li><Link href="/machines-profile"><a className="main-sidebar__link">Machines profile</a></Link></li>
                <li><Link href="/thresholds"><a className="main-sidebar__link">Thresholds</a></Link></li>
                <li><Link href="/login"><a className="main-sidebar__link">Log in</a></Link></li>
                <li><Link href="/logs"><a className="main-sidebar__link">System logs</a></Link></li>
            </ul>
        </nav>
    );
};

export default MainSidebar;
