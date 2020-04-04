// eslint-disable-next-line no-unused-vars
import { Request, ResponseToolkit, HandlerDecorations, Lifecycle } from '@hapi/hapi';
// eslint-disable-next-line no-unused-vars
import { ILogEntriesRepository } from '../Repositories/ILogEntriesRepository';
// eslint-disable-next-line no-unused-vars
import { LogEntryValue } from '../Models/LogEntryValue';

export class LogEntriesController {
    constructor(private repository: ILogEntriesRepository) {}

    async HandleGet(request: Request, h: ResponseToolkit) {
        let start: number = parseInt(request.params.start);
        let size: number = parseInt(request.params.size);
        let severity: string = request.params.severity;

        if (!start) {
            start = 0;
        }

        if (!size) {
            size = 50;
        }

        if (!severity) {
            severity = 'info';
        }

        return this.repository.ReadEntries(start, size, severity);
    }

    async HandlePut(request: Request, h: ResponseToolkit) {
        const entry = <LogEntryValue>request.payload;

        await this.repository.WriteEntry(entry.text, entry.source);

        return {
            result: true,
        };
    }
};
