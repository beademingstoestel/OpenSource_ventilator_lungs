// eslint-disable-next-line no-unused-vars
import { ISettingsRepository } from './ISettingsRepository';

export class TestSettingsRepository implements ISettingsRepository {
    private settings: any = {};

    async GetSettings(): Promise<any> {
        return new Promise((resolve, reject) => resolve(this.settings));
    }

    async SaveSettings(settings: any): Promise<void> {
        this.settings = settings;

        return new Promise((resolve, reject) => {

            resolve();
        });
    }

};
