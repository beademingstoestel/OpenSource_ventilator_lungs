import React, { useState, useEffect } from 'react';
import cx from 'classnames';
import MasterLayout from '../components/master-layout';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import { getApiUrl } from '../helpers/api-urls';

const LogsPage = ({ className, ...other }) => {
    const [rows, setRows] = useState([]);
    const [version, setVersion] = useState('-');
    const [daemonVersion, setDaemonVersion] = useState('-');
    const [firmwareVersion, setFirmwareVersion] = useState('-');

    useEffect(() => {
        const fetchData = async () => {
            const resLogs = await fetch(`${getApiUrl()}/api/logs`);
            setRows(await resLogs.json());

            const resSettings = await fetch(`${getApiUrl()}/api/settings`);
            const settings = await resSettings.json();
            setVersion(settings.GUI_VERSION);
            setDaemonVersion(settings.DAEMON_VERSION ?? 'not set');
            setFirmwareVersion(settings.FW ?? 'not set');
        };

        fetchData();
    }, []);

    return (
        <MasterLayout>
            <div className={'page-logs'}>
                <div className={'page-logs__header'}>
                    <div className={'page-logs__header__system-info'}>
                        <div className={'page-logs__header__system-info__row'}>
                            <div className={'page-logs__header__system-info__row__label'}>
                                GUI version:
                            </div>
                            <div className={'page-logs__header__system-info__row__value'}>
                                { version }
                            </div>
                        </div>
                        <div className={'page-logs__header__system-info__row'}>
                            <div className={'page-logs__header__system-info__row__label'}>
                                Daemon version:
                            </div>
                            <div className={'page-logs__header__system-info__row__value'}>
                                { daemonVersion }
                            </div>
                        </div>
                        <div className={'page-logs__header__system-info__row'}>
                            <div className={'page-logs__header__system-info__row__label'}>
                                Firmware version:
                            </div>
                            <div className={'page-logs__header__system-info__row__value'}>
                                { firmwareVersion }
                            </div>
                        </div>
                        <div className={'page-logs__header__system-info__row'}>
                            <div className={'page-logs__header__system-info__row__label'}>
                                Server status:
                            </div>
                            <div className={'page-logs__header__system-info__row__value'}>
                                <a href="/status">View status</a>
                            </div>
                        </div>
                    </div>
                    <div className={'page-logs__header__buttons'}>
                        <button className={'btn btn--primary'}>Set test settings</button>
                    </div>
                </div>
                <TableContainer className={'logs-table'} component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell size="small">Time</TableCell>
                                <TableCell size="small">Source</TableCell>
                                <TableCell size="small">Severity</TableCell>
                                <TableCell align="left">Description</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row) => (
                                <TableRow key={row._id}>
                                    <TableCell size="small" className={'logs-table__small-width'}>{new Date(row.loggedAt).toLocaleString()}</TableCell>
                                    <TableCell size="small" className={'logs-table__small-width'}>{row.source}</TableCell>
                                    <TableCell size="small" className={'logs-table__small-width'}>
                                        <div className={'logs-table__severity_column logs-table__severity_column__' + row.severity}>{row.severity}</div>
                                    </TableCell>
                                    <TableCell align="left"><pre>{row.text}</pre></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        </MasterLayout>
    );
};

export default LogsPage;
