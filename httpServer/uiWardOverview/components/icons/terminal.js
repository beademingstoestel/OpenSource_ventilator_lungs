import React from 'react';

import Icon from './icon-base';

const TerminalIcon = ({ ...props }) => {
    return (
        <Icon { ...props }>
            <path d="M123 363c4 4 8 7 13 7s9-2 12-5l72-62c4-4 6-8 6-13 0-6-2-10-6-14l-72-62c-7-6-18-6-25 2-6 7-5 18 2 24l57 50-57 50c-7 5-8 16-2 23zm89-11c0 10 8 18 18 18h76c10 0 18-8 18-18s-8-17-18-17h-76c-10 0-18 8-18 17zM463 65H49c-10 0-18 7-18 17v348c0 9 8 17 18 17h415c9 0 17-7 17-17V82c0-9-8-17-18-17zM196 99c9 0 17 8 17 17s-8 17-17 17c-10 0-17-8-17-17s7-17 17-17zm-55 0c9 0 17 8 17 17s-8 17-17 17c-10 0-17-8-17-17s7-17 17-17zm-55 0c9 0 17 8 17 17s-8 17-17 17-17-8-17-17 8-17 17-17zm360 314H66V167h380v246z"/>
        </Icon>
    );
};

export default TerminalIcon;
