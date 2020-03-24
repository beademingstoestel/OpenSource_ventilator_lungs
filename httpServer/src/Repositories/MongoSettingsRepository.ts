// eslint-disable-next-line no-unused-vars
import { ISettingsRepository } from './ISettingsRepository';
// eslint-disable-next-line no-unused-vars
import { MongoClient, Db } from 'mongodb';

export class MongoSettingsRepository implements ISettingsRepository {
    constructor(private mongoClient: MongoClient) {}

    async GetSettings(type: string): Promise<any> {
        try {
            if (!this.mongoClient.isConnected()) {
                await this.mongoClient.connect();
            }

            const db: Db = this.mongoClient.db('beademing');

            const settingsObjects = await db.collection('settings').find({ type }).toArray();

            if (settingsObjects.length) {
                const settingsObject = settingsObjects[0];
                delete settingsObject.type;

                return settingsObject;
            } else {
                return {};
            }
        } catch (exception) {
            // todo: log exception
            console.error(exception);
        }
    }

    async SaveSettings(type: string, settings: any): Promise<void> {
        try {
            if (!this.mongoClient.isConnected()) {
                await this.mongoClient.connect();
            }

            settings.type = type;

            const db: Db = this.mongoClient.db('beademing');

            await db.collection('settings').replaceOne({ type }, settings, { upsert: true });
        } catch (exception) {
            // todo: log exception
            console.error(exception);
        }
    }
};
