const transFormOnSwitchState = (switched) => {
    if (switched) {
        return { transform: 'rotate(180deg)' };
    } else {
        return { transform: 'rotate(360deg)' };
    }
};

const Switch = ({ isChecked = false, label = '', switched = true, switchChanged = null }) => {
    return (
        <div className="switch">
            <svg xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                focusable="false"
                width="2rem"
                height="2rem"
                style={transFormOnSwitchState(switched)}
                preserveAspectRatio="xMidYMid meet"
                viewBox="0 0 24 24">
                <path d="M17 7H7a5 5 0 0 0-5 5a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5a5 5 0 0 0-5-5M7 15a3 3 0 0 1-3-3a3 3 0 0 1 3-3a3 3 0 0 1 3 3a3 3 0 0 1-3 3z" fill="white"/>
            </svg><span>{label}</span>
        </div>
    );
};

const OptionSwitch = ({ isChecked = false, labelOption1 = '', labelOption2 = '', switched = false, switchChanged = null }) => {
    return (
        <div className="switch">
            <span className={'switch__option1'}>{labelOption1}</span><svg xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                focusable="false"
                width="2rem"
                height="2rem"
                style={transFormOnSwitchState(switched)}
                preserveAspectRatio="xMidYMid meet"
                viewBox="0 0 24 24">
                <path d="M17 7H7a5 5 0 0 0-5 5a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5a5 5 0 0 0-5-5M7 15a3 3 0 0 1-3-3a3 3 0 0 1 3-3a3 3 0 0 1 3 3a3 3 0 0 1-3 3z" fill="white"/>
            </svg><span>{labelOption2}</span>
        </div>
    );
};

export { Switch, OptionSwitch };
