// eslint-disable-next-line no-unused-vars
import { ILogEntriesRepository } from './ILogEntriesRepository';
// eslint-disable-next-line no-unused-vars
import { LogEntryValue } from '../Models/LogEntryValue';

export class TestLogEntriesRepository implements ILogEntriesRepository {

    createData(loggedAt, severity, source, text) {
        return { loggedAt, severity, source, text };
    }

    async ReadEntries(start: number, size: number, severity: string): Promise<LogEntryValue[]> {
        return new Promise((resolve, reject) => {
            const retValue = [
                this.createData(123, severity, 'source 1', 'problem with ABC'),
                this.createData(124, severity, 'source 2', 'problem with DEF'),
                this.createData(125, severity, 'source 3', 'problem with GHI'),
            ];

            resolve(retValue);
        });
    }

    async WriteEntry(text: string, source: string): Promise<any> {
        return new Promise((resolve, reject) => {
            resolve(text);
        });
    }
}
