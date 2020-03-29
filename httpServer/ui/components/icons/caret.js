import React from 'react';

import Icon from './icon-base';

const transforms = {
    'left': null,
    'up': 'rotate(90, 256, 256)',
    'right': 'rotate(180, 256, 256)',
    'down': 'rotate(270, 256, 256)',
};

const CaretIcon = ({ direction = 'left', ...props }) => {
    return (
        <Icon { ...props }>
            <path
                d="M326.5 476.5l-194-194a32.592 32.592 0 010-46.2L333.7 35.2c12.7-12.2 32.7-12.2 45.4 0 13 12.5 13.3 33.2.8 46.2L202 259.4l170.9 170.9c6.1 6.1 9.5 14.4 9.5 23.1 0 18-14.6 32.7-32.7 32.7-8.7-.1-17-3.5-23.2-9.6z"
                transform={ transforms[direction] }
            />
        </Icon>
    );
};

export default CaretIcon;
