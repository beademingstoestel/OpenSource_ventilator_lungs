// eslint-disable-next-line no-unused-vars
import { TimeStampedValue } from '../Models/TimeStampedValue';

export interface IValuesRepository {
    ReadValues(collection: string, since: Date, until: Date): Promise<Array<TimeStampedValue>>;
    InsertValue(collection: string, data: any): Promise<void>;
}
