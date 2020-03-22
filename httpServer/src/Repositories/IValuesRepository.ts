// eslint-disable-next-line no-unused-vars
import { TimeStampedValue } from '../Models/TimeStampedValue';

export interface IValuesRepository {
    ReadValues(collection: string, since: Date): Promise<Array<TimeStampedValue>>;
}
