// eslint-disable-next-line no-unused-vars
import { Request, ResponseToolkit, HandlerDecorations, Lifecycle } from '@hapi/hapi';
// eslint-disable-next-line no-unused-vars
import { ISettingsRepository } from '../Repositories/ISettingsRepository';
const { version } = require('../../package.json');

export class SettingsController {
    constructor(private settingsRepository: ISettingsRepository, private broadCastSettings: (settings: any) => void) {}

    async HandleGet(request: Request, h: ResponseToolkit) {
        const settings = await this.settingsRepository.GetSettings('setting');

        settings.GUI_VERSION = version;

        return settings;
    }

    async HandlePut(request: Request, h: ResponseToolkit) {
        const settings = <object>request.payload;
        const resendComplete = (typeof request.query.returncomplete === 'undefined') ? true : request.query.returncomplete === 'true';

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

        return {
            result: true,
            settings: completeSettings,
        };
    }
};
