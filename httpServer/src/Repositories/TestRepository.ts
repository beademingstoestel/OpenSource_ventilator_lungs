// eslint-disable-next-line no-unused-vars
import { IValuesRepository } from './IValuesRepository';
// eslint-disable-next-line no-unused-vars
import { TimeStampedValue } from '../Models/TimeStampedValue';

export class TestRepository implements IValuesRepository {
    InsertValue(collection: string, data: any): Promise<void> {
        return Promise.resolve();
    }

    ReadValues(collection: string, since: Date, until: Date = new Date()): Promise<TimeStampedValue[]> {
        // return a random value for each 100 ms since since

        const now = new Date().getTime();
        const ret = [];

        const steps = (now - since.getTime()) / 25;

        for (let i = 0; i < steps; i++) {
            const time = since.getTime() + i * 25;
            const seconds = Math.floor(new Date().getSeconds() / 2);

            ret.push({
                value: {
                    flow: Math.sin(time) * 30,
                    pressure: Math.abs(Math.sin(time) * 70),
                    targetPressure: Math.abs(Math.sin(time) * 80),
                    volume: Math.abs(Math.sin(time) * 400),
                    trigger: seconds % 2 ? 1 : 0,
                },
                loggedAt: new Date(time),
            });
        }

        return new Promise((resolve, reject) => resolve(ret));
    }
}
