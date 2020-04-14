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
        const pressureDataResponse = await fetch(`${getApiUrl()}/api/pressure_values?since=${since}&until=${since + timeFrame}`);
        const pressureDatas = (await pressureDataResponse.json()).reverse();

        const pressureArray = [];
        pressureDatas.forEach(pressureData => {
            pressureArray.push({
                x: (new Date(pressureData.loggedAt) - since) / 1000,
                y: pressureData.value,
            });
        });

        const targetPressureDataResponse = await fetch(`${getApiUrl()}/api/targetpressure_values?since=${since}&until=${since + timeFrame}`);
        const targetPressureDatas = (await targetPressureDataResponse.json()).reverse();

        const targetPressureArray = [];
        targetPressureDatas.forEach(targetPressureData => {
            targetPressureArray.push({
                x: (new Date(targetPressureData.loggedAt) - since) / 1000,
                y: targetPressureData.value,
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

        const flowResponse = await fetch(`${getApiUrl()}/api/flow_values?since=${since}&until=${since + timeFrame}`);
        const flowDatas = (await flowResponse.json()).reverse();

        const flowArray = [];
        flowDatas.forEach(flowData => {
            flowArray.push({
                x: (new Date(flowData.loggedAt) - since) / 1000,
                y: flowData.value,
            });
        });

        const newFlowDataPlots = [
            {
                data: flowArray,
                color: '#ff6600',
                fill: true,
            },
        ];

        const volumeResponse = await fetch(`${getApiUrl()}/api/volume_values?since=${since}&until=${since + timeFrame}`);
        const volumeDatas = (await volumeResponse.json()).reverse();

        const volumeArray = [];
        volumeDatas.forEach(volumeData => {
            volumeArray.push({
                x: (new Date(volumeData.loggedAt) - since) / 1000,
                y: volumeData.value,
            });
        });

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
