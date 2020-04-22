// eslint-disable-next-line no-unused-vars
import { IValuesRepository } from './IValuesRepository';
// eslint-disable-next-line no-unused-vars
import { TimeStampedValue } from '../Models/TimeStampedValue';
// eslint-disable-next-line no-unused-vars
import { MongoClient, Db } from 'mongodb';

export class MongoValuesRepository implements IValuesRepository {
    constructor(private mongoClient: MongoClient) { }

    async InsertValue(collection: string, data: any): Promise<void> {
        try {
            const db: Db = this.mongoClient.db('beademing');

            await db.collection(collection).insertOne(data);
        } catch (exception) {
            // todo: log exception
            console.error(exception);
        }
    }

    async UpdateMany(collection: string, filter: any, update: any): Promise<void> {
        try {
            const db: Db = this.mongoClient.db('beademing');

            await db.collection(collection).updateMany(filter, { $set: update });
        } catch (exception) {
            // todo: log exception
            console.error(exception);
        }
    }

    async ReadValues(collection: string, since: Date, until: Date = new Date(), filter: any = {}): Promise<TimeStampedValue[]> {
        try {
            const db: Db = this.mongoClient.db('beademing');

            const dateFilter = {
                loggedAt: {
                    $gte: since,
                    $lte: until,
                },
            };

            return db.collection(collection).find({ ...dateFilter, ...filter }).toArray();
        } catch (exception) {
            // todo: log exception
            console.error(exception);
        }
    }
}
