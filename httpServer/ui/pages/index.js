import React from 'react';
import MasterLayout from '../components/master-layout';
import Dashboard from '../components/dashboard';

const DashboardPage = ({ direction = 'left', ...props }) => {
    return (
        <MasterLayout>
            <Dashboard />
        </MasterLayout>
    );
};

export default DashboardPage;
