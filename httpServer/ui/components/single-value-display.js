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
};

const toIERatio = (value) => {
    if (value <= 0.50) {
        return '1:' + toFixedSafe((1 - value) / value, 2);
    } else {
        return toFixedSafe(value / (1 - value), 2) + ':1';
    }
};

const SingleValueDisplaySettings = ({
    name,
    settingKey,
    value,
    unit,
    decimal = 2,
    step = 1,
    updateValue,
    minValue,
    maxValue,
    warningThreshold = 0,
    displayFunction = 'toFixedSafe',
}) => {
    function display() {
        if (displayFunction === 'toFixedSafe') {
            return toFixedSafe(value, decimal);
        } else if (displayFunction === 'toIERatio') {
            return toIERatio(value);
        }
    }

    return (
        <div className="single-value-display-settings">
            <div className="single-value-display-settings__name" >{name}</div>
            <NumPad.Number
                onChange={(newValue) => {
                    if (isInputInRange(minValue, maxValue, newValue)) {
                        // only update the value if input is in range
                        updateValue(settingKey, newValue);

                        if ((warningThreshold !== 0) && (newValue >= warningThreshold)) {
                            toast.warn('Warning: ' + newValue + ' is close to the maximum of ' + maxValue, {
                                position: toast.POSITION.BOTTOM_LEFT,
                            });
                        } else {
                            toast.success(name + ' updated to: ' + newValue, {
                                position: toast.POSITION.BOTTOM_LEFT,
                            });
                        }
                    } else {
                        toast.error('Value ' + newValue + ' is out of range. Min: ' + minValue + ' Max: ' + maxValue, {
                            position: toast.POSITION.BOTTOM_LEFT,
                        });
                    }
                }}
                decimal={decimal}
                negative={false}
                position="center"
                value={toFixedSafe(value, decimal)}
                theme="hello"
            >
                <span className="single-value-display-settings__value">{display(value, decimal)}</span>
                <span className="single-value-display-settings__unit">{unit}</span>
            </NumPad.Number>
            <div className="single-value-display-settings__controls">
                <button
                    className="single-value-display-settings__control"
                    onClick={(ev) => {
                        var newValue = ((decimal === false ? parseInt(value) : parseFloat(value)) - step);

                        newValue = Math.max(newValue, minValue);
                        updateValue(settingKey, newValue);
                        ev.preventDefault();
                    }}
                >
                    <CaretIcon direction="down" size="md" />
                </button>
                <button
                    className="single-value-display-settings__control"
                    onClick={(ev) => {
                        var newValue = ((decimal === false ? parseInt(value) : parseFloat(value)) + step);

                        newValue = Math.min(newValue, maxValue);
                        updateValue(settingKey, newValue);
                        ev.preventDefault();
                    }}
                >
                    <CaretIcon direction="up" size="md" />
                </button>
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
    decimal = 2,
    status = 'default',
    children,
    className,
    displayFunction = 'toFixedSafe',
    ...other
}) => {
    function display() {
        if (displayFunction === 'toFixedSafe') {
            return toFixedSafe(value, decimal);
        } else if (displayFunction === 'toIERatio') {
            return toIERatio(value);
        }
    }

    return (
        <div className={cx('single-value-display', `single-value-display--${status}`, className)} {...other}>
            <div className="single-value-display__data">
                <div className="single-value-display__name" dangerouslySetInnerHTML={{ __html: name }}></div>
                <div className="single-value-display__value">{display()}</div>
            </div>
        </div>
    );
};

export { SingleValueDisplay, SingleValueDisplaySettingsOnly, SingleValueDisplaySettings };
