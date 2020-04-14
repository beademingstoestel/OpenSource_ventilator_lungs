import DataPlot from '../components/data-plot';
import cx from 'classnames';
import BellIcon from '../components/icons/bell';

import { getApiUrl } from '../helpers/api-urls';

const twelveHoursMs = 12 * 3600 * 1000;

export default class HistoryOverview extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            pressureDataPlots: [],
            flowDataPlots: [],
            volumeValues: [],
            alarms: [],
        };
    }

    async componentDidMount() {
        // get alarms from latest 12 hours
        const alarmsResponse = await fetch(`${getApiUrl()}/api/alarms?since=${twelveHoursMs}`);
        const alarms = await alarmsResponse.json();

        this.setState({
            alarms,
        });
    }

    async getData() {

    }

    render() {
        return (
            <div className={cx('page-history', this.props.className)}>
                <div className={'page-history__alarms-list'}>
                    {this.state.alarms.length > 0 && this.state.alarms.map((alarm) => {
                        return (<div key={alarm._id} className={'page-history__alarms-list__entry'}>
                            <div className={'page-history__alarms-list__entry__title alarm'}>
                                <BellIcon></BellIcon><div>{new Date(alarm.loggedAt).toLocaleString()}</div>
                            </div>
                        </div>);
                    })}
                </div>
                <div className={'page-history__graphs'}>
                    <div className="box u-mt-1">
                        <div className="box__body">
                            <DataPlot title='Pressure (cmH2O)'
                                data={this.state.pressureDataPlots}
                                multipleDatasets={true}
                                timeScale={this.state.xLengthMs / 1000.0}
                                minY={-5}
                                maxY={40} />
                            <DataPlot title='Flow (L/min)'
                                data={this.state.flowDataPlots}
                                multipleDatasets={true}
                                timeScale={this.state.xLengthMs / 1000.0}
                                minY={-100}
                                maxY={100} />
                            <DataPlot title='Volume (mL)'
                                data={this.state.volumeValues}
                                multipleDatasets={true}
                                timeScale={this.state.xLengthMs / 1000.0}
                                minY={-50}
                                maxY={800} />
                        </div>
                    </div>
                </div>
            </div>
        );
    };
}
