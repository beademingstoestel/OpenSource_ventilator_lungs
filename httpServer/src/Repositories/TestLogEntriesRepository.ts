// eslint-disable-next-line no-unused-vars
import { ILogEntriesRepository } from './ILogEntriesRepository';
// eslint-disable-next-line no-unused-vars
import { LogEntryValue } from '../Models/LogEntryValue';

export class TestLogEntriesRepository implements ILogEntriesRepository {

    createData(loggedAt, source, text) {
        return { loggedAt, source, text };
    }

    async ReadEntries(since: Date): Promise<LogEntryValue[]> {
        return new Promise((resolve, reject) => {
            let retValue = [
                this.createData(123, "source 1", "problem with ABC"),
                this.createData(124, "source 2", "problem with DEF"),
                this.createData(125, "source 3", "problem with GHI"),
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
