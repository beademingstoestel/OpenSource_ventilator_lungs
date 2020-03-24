import React from 'react';

import Icon from './icon-base';

const PersonIcon = ({ ...props }) => {
    return (
        <Icon { ...props }>
            <path d="M256 245a107 107 0 100-214 107 107 0 000 214zM64 481h401a209 209 0 00-418 0h17z"/>
        </Icon>
    );
};

export default PersonIcon;
