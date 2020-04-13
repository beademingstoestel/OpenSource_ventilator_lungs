import React from 'react';
import cx from 'classnames';
import MasterLayout from '../components/master-layout';

import { getApiUrl } from '../helpers/api-urls.js';

import { toast } from 'react-toastify';

export class NetworkSettings extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <MasterLayout>
            </MasterLayout>
        );
    };
}

export default NetworkSettings;
