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

    async SaveSettings(type: string, settings: any): Promise<any> {
        const oldSettings = this.settings[type];
        this.settings[type] = { ...oldSettings, ...settings };

        return new Promise((resolve, reject) => {
            resolve(this.settings[type]);
        });
    }
};
