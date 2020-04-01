// eslint-disable-next-line no-unused-vars
import { Request, ResponseToolkit, HandlerDecorations, Lifecycle } from '@hapi/hapi';
// eslint-disable-next-line no-unused-vars
import { ISettingsRepository } from '../Repositories/ISettingsRepository';

export class NetworkSettingsController {
    constructor(private settingsRepository: ISettingsRepository) {}

    async HandleGet(request: Request, h: ResponseToolkit) {
        const networkSettings = await this.settingsRepository.GetSettings('network-settings');
        const retValue = {
            serverAddress: '',
        };

        return { ...retValue, ...networkSettings };
    }

    async HandlePut(request: Request, h: ResponseToolkit) {
        const settings = request.payload;

        await this.settingsRepository.SaveSettings('network-settings', settings);

        return {
            result: true,
        };
    }
};
