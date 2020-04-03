// eslint-disable-next-line no-unused-vars
import { Request, ResponseToolkit, HandlerDecorations, Lifecycle } from '@hapi/hapi';
// eslint-disable-next-line no-unused-vars
import { ILogEntriesRepository } from '../Repositories/ILogEntriesRepository';
import { LogEntryValue } from '../Models/LogEntryValue';

export class LogEntriesController {
    constructor(private repository: ILogEntriesRepository) {}

    DateFromRequest(request: Request): Date {
        let since: Date;

        if (request.query.since) {
            const sinceString: string = <string>request.query.since;
            since = new Date(sinceString);
        } else {
            // default last hour
            since = new Date();
            since.setTime(since.getTime() - (3600 * 1000));
        }

        return since;
    }

    async HandleGet(request: Request, h: ResponseToolkit) {
        const since: Date = this.DateFromRequest(request);

        return this.repository.ReadEntries(since);
    }

    async HandlePut(request: Request, h: ResponseToolkit) {
        const entry = <LogEntryValue> request.payload;

        await this.repository.WriteEntry(entry.text, entry.source);

        return {
            result: true,
        };
    }
};