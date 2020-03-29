import React from 'react';
import MasterLayout from '../components/master-layout';
import GaugeIcon from 'ventilator-lungs-ui/components/icons/gauge';
import BellIcon from 'ventilator-lungs-ui/components/icons/bell';
import Link from 'next/link';

const patients = [
    { id: '001', name: 'John Doe' },
    { id: '002', name: 'Jane Doe' },
    { id: '003', name: 'Jake Smith' },
];

export default class Index extends React.Component {
    render() {
        return (
            <MasterLayout>
                <div>
                    <table className="table">
                        <thead>
                            <tr>
                                <td>&nbsp;</td>
                                <td>#</td>
                                <td>Patient name</td>
                                <td>&nbsp;</td>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                patients.map(({ id, name}) => (
                                    <tr key={ id }>
                                        <td className="is-shrunk">
                                            <div className="option-toggle option-toggle--danger">
                                                <input type="checkbox" id={ `alarm-${ id }` } disabled />
                                                <label htmlFor={ `alarm-${ id }` }>
                                                    <BellIcon size="md" />
                                                </label>
                                            </div>
                                        </td>
                                        <td className="is-shrunk">{ id }</td>
                                        <td>{ name }</td>
                                        <td className="is-shrunk">
                                            <Link href="/patient/[id]" as={`/patient/${ id }`}>
                                                <a class="btn btn--secondary"><GaugeIcon /> See patient detail</a>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </MasterLayout>
        );
    }
}
