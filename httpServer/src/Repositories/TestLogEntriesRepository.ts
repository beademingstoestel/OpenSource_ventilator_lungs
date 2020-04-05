// eslint-disable-next-line no-unused-vars
import { ILogEntriesRepository } from './ILogEntriesRepository';
// eslint-disable-next-line no-unused-vars
import { LogEntryValue } from '../Models/LogEntryValue';

export class TestLogEntriesRepository implements ILogEntriesRepository {
    logEntries: LogEntryValue[] = [];
    id = 0;

    async ReadEntries(start: number, size: number, severity: string): Promise<LogEntryValue[]> {
        return this.logEntries;
    }

    async WriteEntry(entry: LogEntryValue): Promise<void> {
        entry._id = '' + ++this.id;
        this.logEntries.unshift(entry);
    }
}
