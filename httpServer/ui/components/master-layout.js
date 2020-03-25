import React from 'react';
import cx from 'classnames';

import MainSidebar from './main-sidebar';
import Page from './page';

const MasterLayout = ({ children, className, ...other }) => (
    <>
        <div className={ cx('master-layout', className) } { ...other }>
            <MainSidebar className="master-layout__sidebar" />
            <Page className="master-layout__content">
                { children }
            </Page>
        </div>
    </>
);

export default MasterLayout;
