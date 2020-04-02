import React from 'react';
import cx from 'classnames';
import NumPad from 'react-numpad';
import CaretIcon from './icons/caret';

import { toast } from 'react-toastify';

const toFixedSafe = (value, precision) => {
    if (value.toFixed) {
        return value.toFixed(precision);
    } else {
        return value;
    }
};

const isInputInRange = (minValue, maxValue, actualValue) => {
    // return true if the actual value is within range, false otherwise
    return ((actualValue >= minValue) && (actualValue <= maxValue));
}

const SingleValueDisplaySettings = ({ name, settingKey, value, unit, decimal = 2, step = 1, updateValue, minValue, maxValue }) => {
    return (
        <div className="single-value-display-settings">
            <div className="single-value-display-settings__name" >{name}</div>
            <div className="single-value-display-settings__controls">
                <button
                    className="single-value-display-settings__control"
                    onClick={ (ev) => {
                        var newValue = (decimal === false ? parseInt(value) : parseFloat(value)) - step;

                        if (isInputInRange(minValue, maxValue, newValue)) {
                            updateValue(settingKey, newValue);
                        }
                        ev.preventDefault();
                    }}
                >
                    <CaretIcon direction="down" size="md" />
                </button>
                <button
                    className="single-value-display-settings__control"
                    onClick={ (ev) => {
                        var newValue = (decimal === false ? parseInt(value) : parseFloat(value)) + step;

                        if (isInputInRange(minValue, maxValue, newValue)) {
                            updateValue(settingKey, newValue);
                        }
                    }}
                >
                    <CaretIcon direction="up" size="md" />
                </button>
                <NumPad.Number
                    onChange={(newValue) => { 
                        if (isInputInRange(minValue, maxValue, newValue)) {
                            // only update the value if input is in range
                            updateValue(settingKey, newValue);
                            toast.success(name + " updated to: " + newValue);
                        } 
                        else {
                            toast.error("Value " + newValue + " is out of range. Min: " + minValue + " Max: " + maxValue);
                        }
                    }}
                    decimal={ decimal }
                    negative={ false }
                    position="center"
                    value={ toFixedSafe(value, decimal) }
                    theme="hello"
                >
                    <span className="single-value-display-settings__value">{toFixedSafe(value, decimal)}</span>
                    <span className="single-value-display-settings__unit">{unit}</span>
                </NumPad.Number>
            </div>
        </div>
    );
};

const SingleValueDisplaySettingsOnly = ({
    children,
    className,
    ...other
}) => {
    return (
        <div className={cx('single-value-display', 'single-value-display--settings-only', 'single-value-display--default', className)} {...other}>
            {children}
        </div>
    );
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
            <div className="single-value-display__data">
                <div className="single-value-display__name">{name}</div>
                <div className="single-value-display__value">{toFixedSafe(value, 2)}</div>
            </div>
            <div className="single-value-display__settings">
                { children }
            </div>
        </div>
    );
};

export { SingleValueDisplay, SingleValueDisplaySettingsOnly, SingleValueDisplaySettings };
