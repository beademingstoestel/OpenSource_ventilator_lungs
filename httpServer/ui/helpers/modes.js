const modeToBooleans = (mode) => {
    return {
        isFlowTriggered: (mode & 1) === 1,
        isPatientTriggered: (mode & 2) === 2,
        isVolumeLimited: (mode & 4) === 4,
        isAprv: (mode & 8) === 8,
        isInAutoFlow: (mode & 16) === 16,
        hasOxygen: (mode & 32) === 32,
    };
};

const booleansToMode = (isFlowTriggered,
    isPatientTriggered,
    isVolumeLimited,
    hasOxygen) => {
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

    if (hasOxygen) {
        mode |= 32;
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
