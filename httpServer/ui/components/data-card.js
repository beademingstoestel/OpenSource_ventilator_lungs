import React from 'react';
import cx from 'classnames';

const DataCard = ({ value, label, style = 'default', className, ...other }) => {
    return (
        <div className={ cx('data-card', `data-card--${ style }`, className) } { ...other }>
            <div className="data-card__label">{ label }</div>
            <div className="data-card__value">{ value }</div>
        </div>
    );
};

export default DataCard;
