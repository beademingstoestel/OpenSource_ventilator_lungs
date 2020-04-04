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

import { getApiUrl, getWsUrl } from '../helpers/api-urls';

const useStyles = makeStyles({
    table: {
        minWidth: 650,
    },
});

function createData(loggedAt, source, text) {
    return { loggedAt, source, text };
}

const LogsPage = ({ className, ...other }) => {
    const classes = useStyles();

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
            <TableContainer component={Paper}>
                <Table className={classes.table} size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell size="small">Time</TableCell>
                            <TableCell size="small">Source</TableCell>
                            <TableCell align="left">Description</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={row.loggedAt}>
                                <TableCell size="small">{row.loggedAt}</TableCell>
                                <TableCell size="small">{row.source}</TableCell>
                                <TableCell align="left">{row.text}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </MasterLayout>
    );
};

export default LogsPage;
