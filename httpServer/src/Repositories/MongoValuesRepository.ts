// eslint-disable-next-line no-unused-vars
import { IValuesRepository } from './IValuesRepository';
// eslint-disable-next-line no-unused-vars
import { TimeStampedValue } from '../Models/TimeStampedValue';
// eslint-disable-next-line no-unused-vars
import { MongoClient, Db } from 'mongodb';

export class MongoValuesRepository implements IValuesRepository {
    private mongoClient: MongoClient;

    constructor(connectionString: string) {
        this.mongoClient = new MongoClient(connectionString, { useUnifiedTopology: true });
    }

    async ReadValues(collection: string, since: Date): Promise<TimeStampedValue[]> {
        try {
            await this.mongoClient.connect();

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
