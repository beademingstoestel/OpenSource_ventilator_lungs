// eslint-disable-next-line no-unused-vars
import { IValuesRepository } from './IValuesRepository';
// eslint-disable-next-line no-unused-vars
import { TimeStampedValue } from '../Models/TimeStampedValue';

export class TestRepository implements IValuesRepository {
    ReadValues(collection: string, since: Date): Promise<TimeStampedValue[]> {
        // return a random value for each 100 ms since since
        const now = new Date().getTime();

        const randAmplitude = Math.random() * 800;

        const steps = (now - since.getTime()) / 100;

        const ret = [];

        for (let i = 0; i < steps; i++) {
            const time = now + i * 100;
            ret.push({
                value: Math.abs(Math.sin(time) * randAmplitude),
                loggedAt: new Date(time),
            });
        }

        return new Promise((resolve, reject) => resolve(ret));
    }
}
