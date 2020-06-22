import { create, all } from 'mathjs';

const config = { };
const math = create(all, config);

const AlarmBitDefinitions = {
    0: {
        message: 'RR too low',
        negativeMessage: 'The respiratory rate is at {0} breaths per minute instead of {1} breaths per minute',
        positiveMessage: 'The respiratory rate is back to the normal {0} breaths per minute',
        format: [
            math.compile('calculatedValues.respatoryRate'),
            math.compile('settings.RR'),
        ],
        level: 'danger',
    },
    1: {
        message: 'Pressure below lower limit',
        negativeMessage: 'The pressure was at {0} cmH2O which is {1} cmH2O below the lower limit of {2} cmH2O',
        positiveMessage: 'The pressure was within the limits at {0} cmH2O',
        format: [
            math.compile('min(calculatedValues.peakPressure, calculatedValues.pressurePlateau)'),
            math.compile('settings.LPK - min(calculatedValues.peakPressure, calculatedValues.pressurePlateau)'),
            math.compile('settings.LPK'),
        ],
        level: 'danger',
    },
    2: {
        message: 'Tidal volume below lower limit',
        negativeMessage: 'The tidal volume was at {0} ml which is {1} ml below the lower limit of {2} ml',
        positiveMessage: 'The tidal volume was within the limits at {0} ml',
        format: [
            math.compile('calculatedValues.tidalVolume'),
            math.compile('(settings.VT - settings.ADVT) - calculatedValues.tidalVolume'),
            math.compile('(settings.VT - settings.ADVT)'),
        ],
        level: 'danger',
    },
    3: { message: 'Alarm not defined', ignore: true },
    4: {
        message: 'Peep not within limits',
        negativeMessage: 'The PEEP value is not within the limits',
        positiveMessage: 'The PEEP value is within the limits',
        format: [],
        level: 'danger',
    },
    5: {
        message: 'Pressure above upper limit',
        negativeMessage: 'The pressure was at {0} cmH2O which is {1} cmH2O over the upper limit of {2} cmH2O',
        positiveMessage: 'The pressure was within the limits at {0} cmH2O',
        format: [
            math.compile('max(calculatedValues.peakPressure, calculatedValues.pressurePlateau)'),
            math.compile('max(calculatedValues.peakPressure, calculatedValues.pressurePlateau) - settings.HPK'),
            math.compile('settings.HPK'),
        ],
        level: 'danger',
    },
    6: {
        message: 'Tidal volume above upper limit',
        negativeMessage: 'The tidal volume was at {0} ml which is {1} ml above the upper limit of {2} ml',
        positiveMessage: 'The tidal volume was within the limits at {0} ml',
        format: [
            math.compile('calculatedValues.tidalVolume'),
            math.compile('calculatedValues.tidalVolume - (settings.VT + settings.ADVT)'),
            math.compile('(settings.VT + settings.ADVT)'),
        ],
        level: 'danger',
    },
    7: {
        message: 'Residual volume is not zero',
        negativeMessage: 'The residual volume at the end of the breathing cycle was {0} ml',
        positiveMessage: 'The residual volume at the end of the breathing cycle is back to {0} ml',
        format: [
            math.compile('calculatedValues.residualVolume'),
        ],
        level: 'danger',
    },
    8: {
        message: 'Arduino not found',
        negativeMessage: 'The connection to the arduino was lost',
        positiveMessage: 'Connection with arduino established',
        format: [],
        level: 'danger',
    },
    9: {
        message: 'Tidal volume too low',
        negativeMessage: 'The tidal volume was at {0} ml which is {1} ml below the limit of {2} ml',
        positiveMessage: 'The tidal volume was within the limits at {0} ml',
        format: [
            math.compile('calculatedValues.tidalVolume'),
            math.compile('settings.ADVT - calculatedValues.tidalVolume'),
            math.compile('settings.ADVT'),
        ],
        level: 'danger',
    },
    10: {
        message: 'FiO2 percentage below lower limit',
        negativeMessage: 'The FiO2 percentage was at {0}% which is {1}% below the lower limit of {2}%',
        positiveMessage: 'The FiO2 percentage was within the limits at {0}%',
        format: [
            math.compile('calculatedValues.fiO2 * 100'),
            math.compile('((settings.FIO2 - settings.ADFIO2) - calculatedValues.fiO2) * 100'),
            math.compile('(settings.FIO2 - settings.ADFIO2) * 100'),
        ],
        level: 'danger',
    },
    11: {
        message: 'FiO2 percentage above upper limit',
        negativeMessage: 'The FiO2 percentage was at {0}% which is {1}% above the upper limit of {2}%',
        positiveMessage: 'The FiO2 percentage was within the limits at {0}%',
        format: [
            math.compile('calculatedValues.fiO2 * 100'),
            math.compile('(calculatedValues.fiO2 - (settings.FIO2 + settings.ADFIO2)) * 100'),
            math.compile('(settings.FIO2 + settings.ADFIO2) * 100'),
        ],
        level: 'danger',
    },
    12: {
        message: 'Respiratory rate too high',
        negativeMessage: 'The respiratory rate is at {0} breaths per minute instead which is above the upper limit of {1} breaths per minute',
        positiveMessage: 'The respiratory rate is back to the normal {0} breaths per minute',
        format: [
            math.compile('calculatedValues.respatoryRate'),
            math.compile('settings.HRR'),
        ],
        level: 'danger',
    },
    13: { message: 'Alarm not defined', ignore: true },
    14: { message: 'Alarm not defined', ignore: true },
    15: { message: 'Alarm not defined', ignore: true },
    16: { message: 'FIO2 not within bounds (arduino)', redundantWith: 11 },
    17: { message: 'Pressure not within thresholds (arduino)', redundantWith: 5 },
    18: { message: 'Volume not within thresholds (arduino)', redundantWith: 6, ignore: true },
    19: {
        message: 'Oxygen supply failed',
        negativeMessage: 'There was a problem with the oxygen supply, check the tubes',
        positiveMessage: 'Oxygen supply OK',
        format: [],
        ignore: false,
    },
    20: {
        message: 'Pressure sensor error',
        negativeMessage: 'There was a problem reading the pressure, check the connections',
        positiveMessage: 'Pressure sensor OK',
        format: [],
        level: 'danger',
    },
    21: {
        message: 'Ventilator overheating',
        negativeMessage: 'The ambient temperature in the ventilator is too high',
        positiveMessage: 'The ambient temperature in the ventilator is OK',
        format: [],
        level: 'danger',
    },
    22: {
        message: 'Flow sensor error',
        negativeMessage: 'There was a problem reading the flow, check the connections',
        positiveMessage: 'Flow sensor OK',
        format: [],
        level: 'danger',
    },
    23: {
        message: 'Pressure sensor initialization failed',
        negativeMessage: 'Pressure sensor initialization failed, restart the ventilator',
        positiveMessage: 'Pressure sensor initialization OK',
        format: [],
        level: 'danger',
        initError: true,
    },
    24: {
        message: 'Flow sensor initialization failed',
        negativeMessage: 'Flow sensor initialization failed, restart the ventilator',
        positiveMessage: 'Flow sensor initialization OK',
        format: [],
        level: 'danger',
        initError: true,
    },
    25: {
        message: 'Limit switch sensor error',
        negativeMessage: 'There was a problem reading the limit switches, check the connections',
        positiveMessage: 'Limit switches sensor OK',
        format: [],
        level: 'danger',
        initError: true,
    },
    26: {
        message: 'Oxygen sensor initialization failed',
        negativeMessage: 'Oxygen sensor initialization failed, restart the ventilator',
        positiveMessage: 'Oxygen sensor initialization OK',
        format: [],
        level: 'danger',
        ignore: false,
        initError: true,
    },
    27: {
        message: 'No external power connected',
        negativeMessage: 'The external power has been disconnected, the ventilator switched to battery power',
        positiveMessage: 'External power connected',
        format: [],
        level: 'warning',
    },
    28: {
        message: 'Battery low',
        negativeMessage: 'The remaining battery energy level is low',
        positiveMessage: 'The battery is recharching',
        format: [],
        level: 'warning',
    },
    29: {
        message: 'Battery critical',
        negativeMessage: 'The remaining battery energy level is critically low',
        positiveMessage: 'The battery is recharching',
        format: [],
        level: 'danger',
    },
    30: {
        message: 'Fan not operational',
        negativeMessage: 'The fan cooling down the ventilator is no longer operational, this might lead to overheating',
        positiveMessage: 'The fan became operational again',
        format: [],
        level: 'warning',
    },
    31: {
        message: 'GUI not found',
        negativeMessage: 'GUI not found',
        positiveMessage: 'GUI found',
        format: [],
        level: 'danger',
    },
};

const formatAlarmMessage = (alarmBit, isNegative, context) => {
    const message = isNegative ? AlarmBitDefinitions[alarmBit].negativeMessage : AlarmBitDefinitions[alarmBit].positiveMessage;
    const regex = /\{([0-9])*\}/g;
    const format = AlarmBitDefinitions[alarmBit].format;

    return message.replace(regex, (match, index) => {
        try {
            return format[parseInt(index)].evaluate(context).toFixed(2);
        } catch (e) {
            console.log(e);
            return match;
        }
    });
};

export { AlarmBitDefinitions, formatAlarmMessage };
