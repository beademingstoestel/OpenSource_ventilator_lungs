// eslint-disable-next-line no-unused-vars
import React from 'react';

export default class SingleValueDisplay extends React.Component {

    render() {
        const name = this.props.name;
        const status = this.props.status;
        const value = this.props.value;

        // Still need to do something with the status

        return (
            <div>
                <h1>{name}</h1>
                <span class="">{value}</span>
            </div>
        );
    }
}
