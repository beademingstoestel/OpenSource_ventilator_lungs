// eslint-disable-next-line no-unused-vars
import { IValuesRepository } from './IValuesRepository';
// eslint-disable-next-line no-unused-vars
import { TimeStampedValue } from '../Models/TimeStampedValue';

export class TestRepository implements IValuesRepository {
    ReadValues(collection: string, since: Date): Promise<TimeStampedValue[]> {
        // return a random value for each 100 ms since since

        const now = new Date().getTime();
        const ret = [];
        if (collection !== 'trigger_values') {
            let randAmplitude = 1;

            if (collection === 'volume_values') {
                randAmplitude = 600;
            } else if (collection === 'pressure_values') {
                randAmplitude = 70;
            } else if (collection === 'flow_values') {
                randAmplitude = 30;
            } else {
                randAmplitude = 40;
            }

            const steps = (now - since.getTime()) / 25;

            for (let i = 0; i < steps; i++) {
                const time = since.getTime() + i * 25;
                ret.push({
                    value: collection !== 'flow_values' ? Math.abs(Math.sin(time) * randAmplitude) : Math.sin(time) * randAmplitude,
                    loggedAt: new Date(time),
                });
            }
        } else {
            const seconds = Math.floor(new Date().getSeconds() / 2);

            ret.push({
                value: seconds % 2 ? 1 : 0,
                loggedAt: new Date(now),
            });
        }

        return new Promise((resolve, reject) => resolve(ret));
    }
}
