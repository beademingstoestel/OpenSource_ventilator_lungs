import React from 'react';
import cx from 'classnames';
import NumPad from 'react-numpad';

const toFixedSafe = (value, precision) => {
    if (value.toFixed) {
        return value.toFixed(precision);
    } else {
        return value;
    }
};

const SmallSingleValueDisplay = ({ name, settingKey, value, unit, decimal = 2, updateValue }) => {
    return (<div>
        <div className="single-value-display__name">{name}</div>
        <div className="single-value-display__value-small">
            <NumPad.Number onChange={(newValue) => updateValue(settingKey, newValue)}
                decimal={decimal}
                negative={false}>
                <span className="single-value-display__value-small__value-field">{toFixedSafe(value, decimal)}</span>
                <span className="single-value-display__value-small__unit-field">{unit}</span>
            </NumPad.Number>
        </div>
    </div>);
};

const SingleValueDisplay = ({
    value,
    name,
    unit,
    updateValue,
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
