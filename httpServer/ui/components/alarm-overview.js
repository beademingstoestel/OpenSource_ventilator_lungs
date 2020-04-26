import React, { useState, useEffect, useRef } from 'react';
import cx from 'classnames';
import { getApiUrl, getWsUrl } from '../helpers/api-urls';
import { Client } from '@hapi/nes/lib/client';
import { AlarmBitDefinitions, formatAlarmMessage } from '../helpers/alarm-definitions';
import HistoryIcon from './icons/history';

const AlarmOverview = ({ className, ...other }) => {
    const currentAlarmsRef = useRef({});
    const alarmCountRef = useRef(0);
    const alarmLevelRef = useRef('warning');
    const [currentAlarms, setCurrentAlarms] = useState([]);
    const [alarmLevel, setAlarmLevel] = useState('warning');
    const [showPopout, setShowPopout] = useState(false);
    const [alarmCount, setAlarmCount] = useState(0);

    async function resetAlarm(e) {
        try {
            const tosend = {};
            tosend.RA = 1;

            // returncomplete also makes sure the python code and controller only receive the changed values
            await fetch(`${getApiUrl()}/api/settings?returncomplete=false`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(tosend),
            });

            setAlarmCount(0);
            setAlarmLevel('warning');
            setCurrentAlarms({});
        } catch (e) {
            // todo: show error to the user
            console.log(e);
        }
    }

    function addAlarm(newAlarm) {
        const currentAlarms = [...currentAlarmsRef.current];

        let newAlarmCount = alarmCountRef.current;
        let shiftAlarm = newAlarm.data.raisedAlarms;
        let shiftResolvedAlarm = newAlarm.data.resolvedAlarms;

        let alarmLevel = alarmLevelRef.current;

        for (let i = 0; i < 32; i++) {
            let useBit = i;
            if (AlarmBitDefinitions[i].redundantWith) {
                useBit = AlarmBitDefinitions[i].redundantWith;
            }
            const existingAlarm = currentAlarms.filter((alarm) => alarm.alarmBit === useBit);

            if ((shiftAlarm & 1) > 0 && AlarmBitDefinitions[i].ignore !== true) {
                newAlarmCount++;

                if (AlarmBitDefinitions[useBit].level === 'danger') {
                    alarmLevel = 'danger';
                }

                if (existingAlarm.length > 0) {
                    existingAlarm[0].messages.unshift({
                        time: new Date(newAlarm.loggedAt),
                        status: 'raised',
                        message: formatAlarmMessage(useBit, true, newAlarm.data),
                    });
                    existingAlarm[0].status = 'raised';
                } else {
                    currentAlarms.push({
                        messages: [{
                            time: new Date(newAlarm.loggedAt),
                            status: 'raised',
                            message: formatAlarmMessage(useBit, true, newAlarm.data),
                        }],
                        alarmBit: useBit,
                        status: 'raised',
                        level: AlarmBitDefinitions[useBit].level,
                        headerMessage: AlarmBitDefinitions[useBit].message,
                    });
                }
            }

            if ((shiftResolvedAlarm & 1) > 0 && AlarmBitDefinitions[i].ignore !== true) {
                if (existingAlarm.length > 0) {
                    existingAlarm[0].messages.unshift({
                        time: new Date(newAlarm.loggedAt),
                        status: 'resolved',
                        message: formatAlarmMessage(useBit, false, newAlarm.data),
                    });
                    existingAlarm[0].status = 'resolved';
                } else {
                    currentAlarms.push({
                        messages: [{
                            time: new Date(newAlarm.loggedAt),
                            status: 'resolved',
                            message: formatAlarmMessage(useBit, false, newAlarm.data),
                        }],
                        alarmBit: useBit,
                        status: 'resolved',
                        level: AlarmBitDefinitions[useBit].level,
                        headerMessage: AlarmBitDefinitions[useBit].message,
                    });
                }
            }

            shiftAlarm = shiftAlarm >> 1;
            shiftResolvedAlarm = shiftResolvedAlarm >> 1;
        }

        setCurrentAlarms(currentAlarms.sort((a, b) => {
            if (a.level === 'warning' && b.level === 'danger') {
                return 1;
            }

            if (b.level === 'warning' && a.level === 'danger') {
                return -1;
            }

            const aRaisedMessages = a.messages.filter(m => m.status === 'raised');
            const bRaisedMessages = b.messages.filter(m => m.status === 'raised');

            if (aRaisedMessages.length === 0) {
                return -1;
            }

            if (bRaisedMessages.length > 0) {
                if (bRaisedMessages[0].time < aRaisedMessages[0].time) {
                    return -1;
                } else {
                    return 1;
                }
            }

            return 0;
        }));
        setAlarmCount(newAlarmCount);
        setAlarmLevel(alarmLevel);
    }

    useEffect(() => {
        currentAlarmsRef.current = currentAlarms;
    }, [currentAlarms]);

    useEffect(() => {
        alarmCountRef.current = alarmCount;
    }, [alarmCount]);

    useEffect(() => {
        alarmLevelRef.current = alarmLevel;
    }, [alarmLevel]);

    useEffect(() => {
        const client = new Client(`${getWsUrl()}`);
        let isConnected = false;

        client.onConnect = () => { isConnected = true; };

        const subscribeAlarm = async () => {
            // get the historical alarms
            await client.connect();

            try {
                const alarms = await client.request('/api/alarms?since=0');

                alarms.payload.reverse().forEach((alarm) => {
                    addAlarm(alarm);
                });
            } catch (e) {
                console.log(e);
            }

            client.subscribe('/api/alarms', (alarm) => {
                addAlarm(alarm);
            });
        };

        subscribeAlarm();

        return function cleanUp() {
            try {
                if (isConnected) {
                    client.disconnect();
                }
            } catch (exception) { console.log(exception); }
        };
    }, []);

    function renderAlarms() {
        const elements = [];
        console.log('render alarms');

        currentAlarms.forEach((alarm) => {
            elements.push(
                <div className={'alarm-overview__popout__entry ' + alarm.level} key={'alarm-' + alarm.alarmBit}>
                    <div className={'alarm-overview__popout__entry__title'}>
                        { alarm.headerMessage }
                    </div>
                    <ul>
                        { alarm.messages.map((message) => {
                            return (
                                <li className={message.status} key={'alarm-' + alarm.alarmBit + '-' + message.time}>
                                    <strong>{message.time.toLocaleTimeString()}</strong>: {message.message}
                                </li>
                            );
                        })}
                    </ul>
                </div>);
        });

        return elements;
    }

    return (
        alarmCount > 0 &&
        <div className={'alarm-overview threed-btn--horizontal-group'}>
            <div className={'alarm-overview__buttons threed-btn--horizontal-group'}>
                <button className={cx('threed-btn', alarmLevel, 'button-1')} onClick={() => resetAlarm()}>RESET {alarmCount} ALARMS</button>
                <div className={cx('alarm-overview__buttons__highlighted-alarm', 'threed-btn', alarmLevel, 'button-2', { pressed: showPopout })}
                    onClick={(e) => setShowPopout(!showPopout)}>
                    <span>{ currentAlarms[0].headerMessage }</span>
                </div>
                <a className={cx('threed-btn', alarmLevel, 'button-3')} href="/history">
                    <HistoryIcon></HistoryIcon>
                </a>
            </div>

            {showPopout &&
                <div className="alarm-overview__popout">
                    { renderAlarms() }
                </div>
            }
        </div>
    );
};

export default AlarmOverview;
