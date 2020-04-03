// eslint-disable-next-line no-unused-vars
import { ILogEntriesRepository } from './ILogEntriesRepository';
// eslint-disable-next-line no-unused-vars
import { LogEntryValue } from '../Models/LogEntryValue';
// eslint-disable-next-line no-unused-vars
import { MongoClient, Db } from 'mongodb';

export class MongoLogEntriesRepository implements ILogEntriesRepository {
    constructor(private mongoClient: MongoClient) { }

    async ReadEntries(since: Date): Promise<LogEntryValue[]> {
        try {
            if (!this.mongoClient.isConnected()) {
                await this.mongoClient.connect();
            }

            const db: Db = this.mongoClient.db('beademing');

            return db.collection('logs').find({
                loggedAt: {
                    $gt: since,
                },
            }).toArray();
        } catch (exception) {
            // todo: log exception
            console.error(exception);
        }
    }

    async WriteEntry(text: string, source: string): Promise<any> {
        try {
            if (!this.mongoClient.isConnected()) {
                await this.mongoClient.connect();
            }

            const db: Db = this.mongoClient.db('beademing');

            await db.collection('logs').insertOne({ text, source, loggedAt: Date.now});

            return text;
        } catch (exception) {
            // todo: log exception
            console.error(exception);
        }
    }
}
