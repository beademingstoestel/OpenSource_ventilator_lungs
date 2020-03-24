import React from 'react';
import cx from 'classnames';
import MasterLayout from '../components/master-layout';

import { toast } from 'react-toastify';

export class PatientInformation extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            firstName: '',
            lastName: '',
            admittanceDate: '',
            info: '',
        };
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    async componentDidMount() {
        // Get the information about the patient
        const res = await fetch('http://localhost:3001/api/patient_info');
        const resData = await res.json();

        console.log(resData);

        this.setState({
            firstName: resData.firstName,
            lastName: resData.lastName,
            admittanceDate: resData.admittanceDate,
            info: resData.info,
        });
    }

    async handleSubmit(ev) {
        ev.preventDefault();

        const res = await fetch('http://localhost:3001/api/patient_info', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                firstName: this.state.firstName,
                lastName: this.state.lastName,
                admittanceDate: this.state.admittanceDate,
                info: this.state.info,
            }),
        });

        const resJson = await res.json();

        if (!resJson.result) {
            toast.error('Failed to update information!');
        } else {
            toast.success('Successfully updated!');
        }
    }

    handleInputChange(ev) {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        this.setState({
            [name]: value,
        });
    }

    render() {
        return (
            <MasterLayout>
                <form action="" className="form" onSubmit={(ev) => this.handleSubmit(ev)}>
                    <div className="form__group">
                        <label htmlFor="firstName" className="form__label">First name</label>
                        <input type="text" className="form__control" id="firstName" name="firstName" value={this.state.firstName} onChange={this.handleInputChange} />
                    </div>
                    <div className="form__group">
                        <label htmlFor="lastName" className="form__label">Last name</label>
                        <input type="text" className="form__control" id="lastName" name="lastName" value={this.state.lastName} onChange={this.handleInputChange} />
                    </div>
                    <div className="form__group">
                        <label htmlFor="admittanceDate" className="form__label">Admittance Date</label>
                        <input type="text" className="form__control" id="admittanceDate" name="admittanceDate" value={this.state.admittanceDate} onChange={this.handleInputChange} />
                    </div>
                    <div className="form__group">
                        <label htmlFor="info" className="form__label">Info</label>
                        <input type="text" className="form__control" id="info" name="info" value={this.state.info} onChange={this.handleInputChange} />
                    </div>
                    <input type="submit" className="btn btn--secondary" />
                </form>
            </MasterLayout >
        );
    };
}

export default PatientInformation;
