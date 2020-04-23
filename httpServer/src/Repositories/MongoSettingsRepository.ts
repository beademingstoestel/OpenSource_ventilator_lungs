// eslint-disable-next-line no-unused-vars
import { ISettingsRepository } from './ISettingsRepository';
// eslint-disable-next-line no-unused-vars
import { MongoClient, Db } from 'mongodb';

export class MongoSettingsRepository implements ISettingsRepository {
    private settingsBuffer: any = {};
    private updateSettingsTimeout: any = {};

    constructor(private mongoClient: MongoClient) {}

    async GetSettings(type: string): Promise<any> {
        try {
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

    async SaveSettings(type: string, settings: any): Promise<any> {
        // this code acts more or less like a lock, making /api/settings can be called asynchronously from other programs
        // and still save all the settings correctly
        if (!this.settingsBuffer[type]) {
            this.settingsBuffer[type] = {};
        }
        this.settingsBuffer[type] = { ...this.settingsBuffer[type], ...settings };

        if (this.updateSettingsTimeout[type] !== null) {
            // we were already going to save, reset this timeout
            clearTimeout(this.updateSettingsTimeout[type]);
        }

        this.updateSettingsTimeout[type] = setTimeout(async (type) => {
            try {
                const newSettings = { ...this.settingsBuffer[type] };
                newSettings.type = type;

                const db: Db = this.mongoClient.db('beademing');

                await db.collection('settings').updateOne({ type }, { $set: { ...newSettings } }, { upsert: true });

                return newSettings;
            } catch (exception) {
                // todo: log exception
                console.error(exception);
            }
        }, 500, type);
    }
};
