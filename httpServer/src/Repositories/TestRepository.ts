// eslint-disable-next-line no-unused-vars
import { IValuesRepository } from './IValuesRepository';
// eslint-disable-next-line no-unused-vars
import { TimeStampedValue } from '../Models/TimeStampedValue';

export class TestRepository implements IValuesRepository {
    ReadValues(collection: string, since: Date): Promise<TimeStampedValue[]> {
        return new Promise((resolve, reject) => {
            resolve([
                {
                    value: 100,
                    loggedAt: new Date(),
                },
            ]);
        });
    }
}
