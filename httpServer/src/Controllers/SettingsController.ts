// eslint-disable-next-line no-unused-vars
import { Request, ResponseToolkit, HandlerDecorations, Lifecycle } from '@hapi/hapi';
// eslint-disable-next-line no-unused-vars
import { ISettingsRepository } from '../Repositories/ISettingsRepository';

export class SettingsController {
    constructor(private settingsRepository: ISettingsRepository, private broadCastSettings: (settings: any) => void) {}

    async HandleGet(request: Request, h: ResponseToolkit) {
        return await this.settingsRepository.GetSettings();
    }

    async HandlePut(request: Request, h: ResponseToolkit) {
        const settings = request.payload;

        await this.settingsRepository.SaveSettings(settings);

        this.broadCastSettings(settings);

        return {
            result: true,
        };
    }
};
