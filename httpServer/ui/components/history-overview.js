import DataPlot from '../components/data-plot';
import cx from 'classnames';
import BellIcon from '../components/icons/bell';

import { getApiUrl } from '../helpers/api-urls';

const twelveHoursMs = new Date().getTime() - 12 * 3600 * 1000;

export default class HistoryOverview extends React.Component {
    since = 0;
    timeFrame = 0;

    constructor(props) {
        super(props);

        this.state = {
            pressureDataPlots: [],
            flowDataPlots: [],
            volumeDataPlots: [],
            events: [],
            xLengthMs: 10,
            title: '',
        };
    }

    async componentDidMount() {
        // get events from latest 12 hours
        const eventsResponse = await fetch(`${getApiUrl()}/api/events?since=${twelveHoursMs}`);
        const events = await eventsResponse.json();

        if (events.length > 0) {
            this.jumpToEvent(events[0]);
        }

        this.setState({
            events,
        });
    }

    async jumpToEvent(event) {
        if (event.type === 'alarm') {
            const startTime = new Date(event.loggedAt).getTime() - 15000;
            this.getData(startTime, 30000);
        }
    }

    async moveGraph(milliseconds) {
        await this.getData(this.since + milliseconds, this.timeFrame);
    }

    async getData(since, timeFrame) {
        const measuredValuesDataResponse = await fetch(`${getApiUrl()}/api/measured_values?since=${since}&until=${since + timeFrame}`);
        const measuredValuesData = (await measuredValuesDataResponse.json()).reverse();

        const pressureArray = [];
        const targetPressureArray = [];
        const flowArray = [];
        const volumeArray = [];
        measuredValuesData.forEach(measurement => {
            pressureArray.push({
                x: (new Date(measurement.loggedAt) - since) / 1000,
                y: measurement.value.pressure,
            });

            targetPressureArray.push({
                x: (new Date(measurement.loggedAt) - since) / 1000,
                y: measurement.value.targetPressure,
            });

            flowArray.push({
                x: (new Date(measurement.loggedAt) - since) / 1000,
                y: measurement.value.flow,
            });

            volumeArray.push({
                x: (new Date(measurement.loggedAt) - since) / 1000,
                y: measurement.value.volume,
            });
        });

        const newPressureDataPlots = [
            {
                data: pressureArray,
                color: '#ff6600',
                fill: true,
            },
            {
                data: targetPressureArray,
                color: '#000',
                fill: true,
            },
        ];

        const newFlowDataPlots = [
            {
                data: flowArray,
                color: '#ff6600',
                fill: true,
            },
        ];

        const newVolumeDataPlots = [
            {
                data: volumeArray,
                color: '#ff6600',
                fill: true,
            },
        ];

        this.setState({
            xLengthMs: timeFrame / 1000,
            pressureDataPlots: newPressureDataPlots,
            flowDataPlots: newFlowDataPlots,
            volumeDataPlots: newVolumeDataPlots,
            title: `History (${new Date(since).toLocaleTimeString()} - ${new Date(since + timeFrame).toLocaleTimeString()})`,
        });

        this.since = since;
        this.timeFrame = timeFrame;
    }

    render() {
        return (
            <div className={cx('page-history', this.props.className)}>
                <div className={'page-history__alarms-list'}>
                    {this.state.events.length > 0 && this.state.events.map((event) => {
                        return (<div key={event._id} className={'page-history__alarms-list__entry'}>
                            <div className={'page-history__alarms-list__entry__title ' + event.type}
                                onClick={(e) => {
                                    this.jumpToEvent(event);
                                    e.preventDefault();
                                }}>
                                <BellIcon></BellIcon><div>{new Date(event.loggedAt).toLocaleString()}</div>
                            </div>
                        </div>);
                    })}
                </div>
                <div className={'page-history__graphs'}>
                    <div className={'page-history__graphs__controls'}>
                        <button onClick={() => this.moveGraph(-5000) }>&lt;</button>
                        <div>{this.state.title}</div>
                        <button onClick={() => this.moveGraph(5000) }>&gt;</button>
                    </div>
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
                                data={this.state.volumeDataPlots}
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
