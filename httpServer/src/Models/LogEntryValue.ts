export interface LogEntryValue {
    _id: string;
    text: string;
    source: string;

    severity: string;

    loggedAt: Date;
}
