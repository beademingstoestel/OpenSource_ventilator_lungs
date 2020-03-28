import React from 'react';
import cx from 'classnames';

const Page = ({ children, className, ...other }) => (
    <div className={ cx('page', className) } { ...other }>
        { children }
    </div>
);

export default Page;
