// eslint-disable-next-line no-unused-vars
import { LogEntryValue } from '../Models/LogEntryValue';

export interface ILogEntriesRepository {
    ReadEntries(since: Date): Promise<Array<LogEntryValue>>;
    WriteEntry(text: string, source: string): Promise<any>;
}