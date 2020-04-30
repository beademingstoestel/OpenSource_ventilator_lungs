import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import cx from 'classnames';
import GearIcon from '../components/icons/gear';

// eslint-disable-next-line no-unused-vars
const SingleValueDisplay = dynamic(() => import('../components/single-value-display').then(mod => mod.SingleValueDisplay), { ssr: false });

const CurrentValues = ({
    calculatedValues,
    currentValues,
}) => {
    const [valuesToShow, setValuesToShow] = useState({
        pressurePlateau: {
            active: true,
            name: 'Plateau pressure',
            value: 'calculatedValues.pressurePlateau',
            label: 'Pressure<br />Plat',
        },
        respiratoryRate: {
            active: true,
            name: 'Respiratory rate',
            value: 'calculatedValues.respatoryRate',
            label: 'Respiratory<br />rate',
        },
        tidalVolume: {
            active: true,
            name: 'Tidal volume',
            value: 'calculatedValues.tidalVolume',
            label: 'Tidal<br />volume (mL)',
        },
        volumePerMinute: {
            active: true,
            name: 'Delivered volume per minute',
            value: 'calculatedValues.volumePerMinute',
            label: 'Delivered<br />volume (L/min)',
        },
        fiO2: {
            active: true,
            name: 'Current FiO2 value',
            value: 'currentValues.fiO2Value',
            label: 'FiO2',
            displayFunction: (value, decimal) => (value * 100).toFixed(0) + '%',
        },
    });

    useEffect(() => {
    }, []);

    function getValue(evalStr, calculatedValues, currentValues) {
        const parts = evalStr. split('.');

        if (parts[0] === 'calculatedValues') {
            return calculatedValues[parts[1]];
        } else if (parts[0] === 'currentValues') {
            return currentValues[parts[1]];
        }

        return 0.0;
    }

    return (
        <div className="current-values">
            <div className="current-values__values">
                {Object.getOwnPropertyNames(valuesToShow).map((property) => {
                    const valueToShow = valuesToShow[property];

                    return (
                        <SingleValueDisplay
                            name={valueToShow.label}
                            value={getValue(valueToShow.value, calculatedValues, currentValues)}
                            decimal={1}
                            status={'normal'}
                            displayFunction={valueToShow.displayFunction}
                        ></SingleValueDisplay>
                    );
                })}
            </div>
            <div className={cx('current-values__settings')}>
            </div>
            <button className={cx('current-values__toggle-button', 'threed-btn', 'base')}>
                <GearIcon></GearIcon>
            </button>
        </div>
    );
};

export default CurrentValues;
