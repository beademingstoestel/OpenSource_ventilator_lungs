// eslint-disable-next-line no-unused-vars
import { Request, ResponseToolkit, HandlerDecorations, Lifecycle } from '@hapi/hapi';
// eslint-disable-next-line no-unused-vars
import { ISettingsRepository } from '../Repositories/ISettingsRepository';

export class PatientInfoController {
    constructor(private settingsRepository: ISettingsRepository) {}

    async HandleGet(request: Request, h: ResponseToolkit) {
        const patientInfo = await this.settingsRepository.GetSettings('patient-info');
        const retValue = {
            firstName: '',
            lastName: '',
            admittanceDate: new Date(),
            info: '',
        };

        return { ...retValue, ...patientInfo };
    }

    async HandlePut(request: Request, h: ResponseToolkit) {
        const settings = request.payload;

        await this.settingsRepository.SaveSettings('patient-info', settings);

        return {
            result: true,
        };
    }
};
