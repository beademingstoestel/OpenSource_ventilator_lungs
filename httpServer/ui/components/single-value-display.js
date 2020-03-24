import React from 'react';
import cx from 'classnames';

const SingleValueDisplay = ({ value, name, status = 'default', className, ...other }) => {
    return (
        <div className={ cx('single-value-display', `single-value-display--${ status }`, className) } { ...other }>
            <div className="single-value-display__name">{ name }</div>
            <div className="single-value-display__value">{ value.toFixed(2) }</div>
        </div>
    );
};

export default SingleValueDisplay;
