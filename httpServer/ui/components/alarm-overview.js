import React, { useState, useEffect, useRef } from 'react';
import cx from 'classnames';
import { getApiUrl, getWsUrl } from '../helpers/api-urls';
import { Client } from '@hapi/nes/lib/client';
import { AlarmBitDefinitions } from '../helpers/alarm-definitions';
import HistoryIcon from './icons/history';

const AlarmOverview = ({ className, ...other }) => {
    const currentAlarmsRef = useRef([]);
    const [currentAlarms, setCurrentAlarms] = useState([]);
    const [alarmLevel, setAlarmLevel] = useState('danger');
    const [showPopout, setShowPopout] = useState(false);
    const [alarmCount, setAlarmCount] = useState(2);

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

            setCurrentAlarms([]);
            setAlarmCount(0);
        } catch (e) {
            // todo: show error to the user
            console.log(e);
        }
    }

    function getAlarmTexts(alarmValue, type) {
        const messages = [];

        let shiftAlarm = alarmValue;

        for (let i = 0; i < 32; i++) {
            if ((shiftAlarm & 1) > 0 && AlarmBitDefinitions[i].ignore !== true) {
                const message = type === 'raised' ? AlarmBitDefinitions[i].message : AlarmBitDefinitions[i].positiveMessage;

                messages.push(<li className={'main-sidebar__alert__entry__values__alarm ' + type}>{message}</li>);
            }

            shiftAlarm = shiftAlarm >> 1;
        }

        return messages;
    }

    function addAlarm(newAlarm) {
        const allAlarms = [...currentAlarmsRef.current];
        allAlarms.unshift(newAlarm);
        setCurrentAlarms(allAlarms);
        console.log(allAlarms);
    }

    useEffect(() => {
        currentAlarmsRef.current = currentAlarms;
    }, [currentAlarms]);

    useEffect(() => {
        const client = new Client(`${getWsUrl()}`);
        let isConnected = false;

        client.onConnect = () => { isConnected = true; };

        const subscribeAlarm = async () => {
            // get the historical alarms
            await client.connect();

            try {
                const alarms = await client.request('/api/alarms?since=0');

                console.log(alarms);

                if (alarms && alarms.statusCode === 200) {
                    setCurrentAlarms(alarms.payload);
                }
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

    return (
        alarmCount > 0 &&
            <div className={'alarm-overview threed-btn--horizontal-group'}>
                <div className={'alarm-overview__buttons threed-btn--horizontal-group'}>
                    <button className={cx('threed-btn', alarmLevel, 'button-1')} onClick={() => resetAlarm()}>RESET {alarmCount} ALARMS</button>
                    <div className={cx('alarm-overview__buttons__highlighted-alarm', 'threed-btn', alarmLevel, 'button-2', { pressed: showPopout })}
                        onClick={(e) => setShowPopout(!showPopout) }>
                        <span>PRESSURE NOT WITHIN LIMITS</span>
                    </div>
                    <a className={cx('threed-btn', alarmLevel, 'button-3')} href="/history">
                        <HistoryIcon></HistoryIcon>
                    </a>
                </div>

                {showPopout &&
                    <div className="alarm-overview__popout">
                        <div className={'alarm-overview__popout__entry warning'}>
                            <div className={'alarm-overview__popout__entry__title'}>
                                No external power
                            </div>
                            <ul>
                                <li className={'raised'}>
                                    <strong>16:56:22</strong>: Loss of external power detected
                                </li>
                            </ul>
                        </div>
                        <div className={'alarm-overview__popout__entry danger'}>
                            <div className={'alarm-overview__popout__entry__title'}>
                                Pressure not within thresholds
                            </div>
                            <ul>
                                <li className={'resolved'}>
                                    <strong>17:01:22</strong>: Peak pressure at 42 cmH2O
                                </li>
                                <li className={'raised'}>
                                    <strong>16:56:22</strong>: Peak pressure 8 cmH2O above upper limit of 45 cmH2O
                                </li>
                            </ul>
                        </div>
                    </div>
                }
            </div>
    );
};

export default AlarmOverview;
