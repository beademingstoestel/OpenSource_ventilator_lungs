// eslint-disable-next-line no-unused-vars
import { ISettingsRepository } from './ISettingsRepository';

export class TestSettingsRepository implements ISettingsRepository {
    private settings: any = {};

    async GetSettings(type: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let retValue = {};

            if (this.settings[type]) {
                retValue = { ...retValue, ...this.settings[type] };
            }

            resolve(retValue);
        });
    }

    async SaveSettings(type: string, settings: any): Promise<void> {
        this.settings[type] = settings;

        return new Promise((resolve, reject) => {
            resolve();
        });
    }
};
