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
            const res = await fetch(`${getApiUrl()}/api/log/read`);
            console.log(res);
            //setRows(res);

            setRows([
                createData(123, "source 1", "problem with ABC"),
                createData(124, "source 2", "problem with DEF"),
                createData(125, "source 3", "problem with GHI"),
            ]);


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
