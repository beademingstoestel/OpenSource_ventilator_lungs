// eslint-disable-next-line no-unused-vars
import { IValuesRepository } from './IValuesRepository';
// eslint-disable-next-line no-unused-vars
import { TimeStampedValue } from '../Models/TimeStampedValue';
// eslint-disable-next-line no-unused-vars
import { MongoClient, Db } from 'mongodb';

export class MongoValuesRepository implements IValuesRepository {
    constructor(private mongoClient: MongoClient) { }

    async ReadValues(collection: string, since: Date): Promise<TimeStampedValue[]> {
        try {
            const db: Db = this.mongoClient.db('beademing');

            return db.collection(collection).find({
                loggedAt: {
                    $gt: since,
                },
            }).toArray();
        } catch (exception) {
            // todo: log exception
            console.error(exception);
        }
    }
}
