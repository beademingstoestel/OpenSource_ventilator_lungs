import React from 'react';
import dynamic from 'next/dynamic';
import MasterLayout from '../../components/master-layout';
import Dashboard from 'ventilator-lungs-ui/components/dashboard';
import { useRouter } from 'next/router';
import Link from 'next/link';

const PatientDetail = () => {
    const router = useRouter();
    const { id: patientID } = router.query;

    return (
        <MasterLayout>
            <div>
                <div className="u-mb-2">
                    <Link href="/"><a>Back to all patients</a></Link>
                </div>
                <Dashboard patient={ patientID } className="u-mt-0" />
            </div>
        </MasterLayout>
    );
};

export default dynamic(() => Promise.resolve(PatientDetail), {
    ssr: false
  });
