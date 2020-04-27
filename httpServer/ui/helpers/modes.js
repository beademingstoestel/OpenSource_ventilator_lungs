const modeToBooleans = (mode) => {
    return {
        isFlowTriggered: (mode & 1) === 1,
        isPatientTriggered: (mode & 2) === 1,
        isVolumeLimited: (mode & 4) === 1,
    };
};

const booleansToMode = (isFlowTriggered, isPatientTriggered, isVolumeLimited) => {
    let mode = 0;

    if (isFlowTriggered) {
        mode = 1;
    }

    if (isPatientTriggered) {
        mode |= 2;
    }

    if (isVolumeLimited) {
        mode |= 4;
    }

    return mode;
};

const modeToAbbreviation = (mode) => {
    const booleans = modeToBooleans(mode);

    if (booleans.isVolumeLimited) {
        return 'PRVC';
    }

    if (booleans.isPatientTriggered) {
        return 'SIMV-PC';
    }

    return 'PC';
};

const modeToString = (mode) => {
    const booleans = modeToBooleans(mode);

    let abbreviation = 'Pressure control';

    if (booleans.isVolumeLimited) {
        abbreviation += ' - volume limited';
    }

    if (!booleans.isPatientTriggered) {
        abbreviation += ' - no trigger';
    } else {
        if (booleans.isFlowTriggered) {
            abbreviation += ' - flow trigger';
        } else {
            abbreviation += ' - pressure trigger';
        }
    }

    return abbreviation;
};

export { modeToAbbreviation, modeToString, modeToBooleans, booleansToMode };
