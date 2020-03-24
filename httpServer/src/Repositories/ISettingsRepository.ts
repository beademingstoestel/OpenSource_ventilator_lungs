export interface ISettingsRepository {
    GetSettings(type: string): Promise<any>;
    SaveSettings(type: string, settings: any): Promise<void>;
};
