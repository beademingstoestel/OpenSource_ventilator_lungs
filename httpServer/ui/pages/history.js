import React from 'react';
import cx from 'classnames';
import HistoryOverview from '../components/history-overview';
import MasterLayout from '../components/master-layout';

import { getApiUrl } from '../helpers/api-urls.js';

import { toast } from 'react-toastify';

class History extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <MasterLayout>
                <HistoryOverview></HistoryOverview>
            </MasterLayout >
        );
    };
}

export default History;
