// eslint-disable-next-line no-unused-vars
import { Request, ResponseToolkit, HandlerDecorations, Lifecycle } from '@hapi/hapi';
// eslint-disable-next-line no-unused-vars
import { ISettingsRepository } from '../Repositories/ISettingsRepository';
// eslint-disable-next-line no-unused-vars
import { IValuesRepository } from '../Repositories/IValuesRepository';
const { version } = require('../../package.json');

export class SettingsController {
    constructor(private settingsRepository: ISettingsRepository,
        private valuesRepository: IValuesRepository,
        private broadCastSettings: (settings: any) => void) {}

    async HandleGet(request: Request, h: ResponseToolkit) {
        const settings = await this.settingsRepository.GetSettings('setting');

        settings.GUI_VERSION = version;

        return settings;
    }

    async HandlePut(request: Request, h: ResponseToolkit) {
        const settings = <any>request.payload;
        const resendComplete = (typeof request.query.returncomplete === 'undefined') ? false : request.query.returncomplete === 'true';

        const completeSettings = await this.settingsRepository.SaveSettings('setting', settings);

        if (resendComplete) {
            this.broadCastSettings(completeSettings);
        } else {
            for (var key in settings) {
                var settingToSend = {};
                settingToSend[key] = settings[key];
                this.broadCastSettings(settingToSend);
            }
        }

        request.log(['debug'], {
            text: 'Update settings value: ' + JSON.stringify(settings, null, '\t'),
            source: 'Node.js',
            severity: 'debug',
        });

        const settingChange = {
            data: settings,
            type: 'setting',
            loggedAt: new Date(),
        };

        // do we have a setting change in the last 5 seconds
        const now = new Date();
        const past = new Date(now.getTime() - 5000);
        const previousSettingsChanges = await this.valuesRepository.ReadValues('events', past, now, { type: 'setting' });

        if (previousSettingsChanges.length > 0) {
            const previousSettingsChange = previousSettingsChanges[0];

            await this.valuesRepository.UpdateMany('events', { _id: previousSettingsChange._id }, { data: { ...previousSettingsChange.data, ...settings } });
        } else {
            await this.valuesRepository.InsertValue('events', settingChange);
        }

        if (settings && settings.RA && settings.RA === 1) {
            // reset all the alarms
            await this.valuesRepository.UpdateMany('events', { reset: false }, { reset: true });
        }

        return {
            result: true,
            settings: completeSettings,
        };
    }
};
