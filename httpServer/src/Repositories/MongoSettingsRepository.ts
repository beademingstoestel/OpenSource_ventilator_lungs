// eslint-disable-next-line no-unused-vars
import { ISettingsRepository } from './ISettingsRepository';
// eslint-disable-next-line no-unused-vars
import { MongoClient, Db } from 'mongodb';

export class MongoSettingsRepository implements ISettingsRepository {

    constructor(private mongoClient: MongoClient) {}

    async GetSettings(): Promise<any> {
        try {
            if (!this.mongoClient.isConnected()) {
                await this.mongoClient.connect();
            }

            const db: Db = this.mongoClient.db('beademing');

            const settingsObjects = await db.collection('settings').find().toArray();

            if (settingsObjects.length) {
                return settingsObjects[0];
            } else {
                return {};
            }
        } catch (exception) {
            // todo: log exception
            console.error(exception);
        }
    }

    async SaveSettings(settings: any): Promise<void> {
        try {
            if (!this.mongoClient.isConnected()) {
                await this.mongoClient.connect();
            }

            const db: Db = this.mongoClient.db('beademing');

            await db.collection('settings').replaceOne({}, settings, { upsert: true });
        } catch (exception) {
            // todo: log exception
            console.error(exception);
        }
    }

};
