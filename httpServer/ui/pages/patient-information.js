import React from 'react';
import cx from 'classnames';
import MasterLayout from '../components/master-layout';

export class PatientInformation extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            firstName: 'John',
            name: 'Doe',
            dateOfAdmission: new Date().toLocaleDateString(),
        };
    }

    render() {
        return (
            <MasterLayout>
                <form action="" className="form">
                    <div className="form__group">
                        <label htmlFor="firstname" className="form__label">First name</label>
                        <input type="text" className="form__control" id="firstname" value={this.state.firstName} />
                    </div>
                    <div className="form__group">
                        <label htmlFor="name" className="form__label">Name</label>
                        <input type="text" className="form__control" id="name" value={this.state.name} />
                    </div>
                    <div className="form__group">
                        <label htmlFor="dateOfAdmission" className="form__label">Date of admission</label>
                        <input type="text" className="form__control" id="dateOfAdmission" value={this.state.dateOfAdmission} />
                    </div>
                    <input type="submit" className="btn btn--secondary" />
                </form>
            </MasterLayout >
        );
    };
}

export default PatientInformation;
