import React from 'react';
import cx from 'classnames';

const toFixedSafe = (value, precision) => {
    if (value.toFixed) {
        return value.toFixed(precision);
    } else {
        return value;
    }
};

const SmallSingleValueDisplay = ({ name, value }) => {
    return (<div>
        <div className="single-value-display__name">{name}</div>
        <div className="single-value-display__value-small">{toFixedSafe(value, 2)}</div>
    </div>);
};

const SingleValueDisplay = ({
    value,
    name,
    status = 'default',
    children,
    className,
    ...other
}) => {
    return (
        <div className={cx('single-value-display', `single-value-display--${status}`, className)} {...other}>
            <div className={cx('single-value-display-big-column')}>
                <div className="single-value-display__name">{name}</div>
                <div className="single-value-display__value">{toFixedSafe(value, 2)}</div>
            </div>
            <div>
                {children}
            </div>
        </div>
    );
};

export { SingleValueDisplay, SmallSingleValueDisplay };
