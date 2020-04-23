const AlarmBitDefinitions = {
    0: { message: 'BPM too low', positiveMessage: 'BPM is normal' },
    1: { message: 'Alarm not defined' },
    2: { message: 'Alarm not defined' },
    3: { message: 'Alarm not defined' },
    4: { message: 'Peep not within thresholds', positiveMessage: 'Peep value is within thresholds' },
    5: { message: 'Pressure not within thresholds', positiveMessage: 'Pressure is within thresholds' },
    6: { message: 'Volume not within thresholds', positiveMessage: 'Volume is within thresholds' },
    7: { message: 'Residual volume is not zero', positiveMessage: 'Residual volume is close to zero' },
    8: { message: 'Arduino not found', positiveMessage: 'Connection with arduino established' },
    9: { message: 'Alarm not defined' },
    10: { message: 'Alarm not defined' },
    11: { message: 'Alarm not defined' },
    12: { message: 'Alarm not defined' },
    13: { message: 'Alarm not defined' },
    14: { message: 'Alarm not defined' },
    15: { message: 'Alarm not defined' },
    16: { message: 'Alarm not defined' },
    17: { message: 'Pressure not within thresholds (arduino)', redundantWith: 5, positiveMessage: 'Pressure is within thresholds (arduino)' },
    18: { message: 'Volume not within thresholds (arduino)', redundantWith: 6, ignore: true, positiveMessage: 'Volume is within thresholds (arduino)' },
    19: { message: 'alarm not defined', ignore: true },
    20: { message: 'Pressure sensor error', positiveMessage: 'Pressure sensor OK' },
    21: { message: 'Machine is overheating', positiveMessage: 'Machine ambient temperature OK' },
    22: { message: 'Flow sensor error', positiveMessage: 'Flow sensor OK' },
    23: { message: 'Pressure sensor calibration failed', positiveMessage: 'Pressure sensor calibration OK' },
    24: { message: 'Flow sensor calibration failed', positiveMessage: 'Flow sensor calibration OK' },
    25: { message: 'Limit switch sensor error', positiveMessage: 'Limit switch sensor OK' },
    26: { message: 'HALL sensor error', positiveMessage: 'HALL sensor OK' },
    27: { message: 'No external power, switch to battery', positiveMessage: 'External power connected' },
    28: { message: 'Battery low', positiveMessage: 'Battery level OK' },
    29: { message: 'Battery critical', positiveMessage: 'Battery level OK' },
    30: { message: 'Fan not operational', positiveMessage: 'Fan operational' },
    31: { message: 'GUI not found', positiveMessage: 'GUI found' },
};

export { AlarmBitDefinitions };
