import React from 'react';
import cx from 'classnames';

import Page from 'ventilator-lungs-ui/components/page';
import MainSidebar from './main-sidebar';

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
