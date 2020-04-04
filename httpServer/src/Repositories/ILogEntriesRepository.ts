// eslint-disable-next-line no-unused-vars
import { LogEntryValue } from '../Models/LogEntryValue';

export interface ILogEntriesRepository {
    ReadEntries(start: number, size: number, severity: string): Promise<Array<LogEntryValue>>;
    WriteEntry(text: string, source: string): Promise<any>;
}