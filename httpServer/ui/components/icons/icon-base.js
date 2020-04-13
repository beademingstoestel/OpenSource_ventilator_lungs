import React from 'react';
import cx from 'classnames';

const Icon = ({ children, size = 'sm', viewboxWidth = 512, viewboxHeight = 512, className, ...other }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox={'0 0 ' + viewboxWidth + ' ' + viewboxHeight} className={ cx('icon', `icon--size-${size}`, className) } { ...other }>
            { children }
        </svg>
    );
};

export default Icon;
