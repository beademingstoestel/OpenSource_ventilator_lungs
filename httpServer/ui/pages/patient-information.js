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
            admittanceTime: '',
            info: '',
        };
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    async componentDidMount() {
        // Get the information about the patient
        const res = await fetch(`http://${process.env.apiURL}/api/patient_info`);
        const resData = await res.json();

        console.log(resData);

        const date = resData.admittanceDate.split('T')[0];
        const time = resData.admittanceDate.split('T')[1];

        this.setState({
            firstName: resData.firstName,
            lastName: resData.lastName,
            admittanceDate: date,
            admittanceTime: time,
            info: resData.info,
        });
    }

    async handleSubmit(ev) {
        ev.preventDefault();

        const res = await fetch(`http://${process.env.apiURL}/api/patient_info`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                firstName: this.state.firstName,
                lastName: this.state.lastName,
                admittanceDate: this.state.admittanceDate + 'T' + this.state.admittanceTime,
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
                <div className="row">
                    <div className="col--lg-6">
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
                                <input type="date" className="form__control" id="admittanceDate" name="admittanceDate" value={this.state.admittanceDate} onChange={this.handleInputChange} />
                            </div>
                            <div className="form__group">
                                <label htmlFor="admittanceTime" className="form__label">Admittance Time</label>
                                <input type="time" className="form__control" id="admittanceTime" name="admittanceTime" value={this.state.admittanceTime} onChange={this.handleInputChange} />
                            </div>
                            <div className="form__group">
                                <label htmlFor="info" className="form__label">Info</label>
                                <input type="text" className="form__control" id="info" name="info" value={this.state.info} onChange={this.handleInputChange} />
                            </div>
                            <input type="submit" className="btn btn--secondary" />
                        </form>
                    </div>
                </div>
            </MasterLayout >
        );
    };
}

export default PatientInformation;
