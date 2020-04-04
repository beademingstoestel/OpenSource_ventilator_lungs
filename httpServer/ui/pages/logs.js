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

    useEffect(() => {
        const fetchRows = async () => {
            const res = await fetch(`${getApiUrl()}/api/logs`);
            setRows(await res.json());
        };

        fetchRows();
    }, []);

    return (
        <MasterLayout>
            <div className={'page-logs'}>
                <div className={'page-logs__system-info'}>
                    <div className={'page-logs__system-info__row'}>
                        <div className={'page-logs__system-info__row__label'}>
                            GUI version:
                        </div>
                        <div className={'page-logs__system-info__row__value'}>
                            1.2
                        </div>
                    </div>
                    <div className={'page-logs__system-info__row'}>
                        <div className={'page-logs__system-info__row__label'}>
                            Python daemon version:
                        </div>
                        <div className={'page-logs__system-info__row__value'}>
                            1.2
                        </div>
                    </div>
                    <div className={'page-logs__system-info__row'}>
                        <div className={'page-logs__system-info__row__label'}>
                            Server status:
                        </div>
                        <div className={'page-logs__system-info__row__value'}>
                            <a href="/status">View status</a>
                        </div>
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
                                <TableRow key={row.loggedAt}>
                                    <TableCell size="small">{row.loggedAt}</TableCell>
                                    <TableCell size="small">{row.source}</TableCell>
                                    <TableCell size="small">
                                        <div className={'severity_column severity_column__severity__' + row.severity}>{row.severity}</div>
                                    </TableCell>
                                    <TableCell align="left">{row.text}</TableCell>
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
