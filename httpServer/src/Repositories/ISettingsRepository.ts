export interface ISettingsRepository {
    GetSettings(): Promise<any>;
    SaveSettings(settings: any): Promise<void>;
};
