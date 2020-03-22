// eslint-disable-next-line no-unused-vars
import { Request, ResponseToolkit, HandlerDecorations, Lifecycle } from '@hapi/hapi';
// eslint-disable-next-line no-unused-vars
import { IValuesRepository } from '../Repositories/IValuesRepository';

export class ValuesController {
    constructor(private repository: IValuesRepository, private collection: string) {}

    DateFromRequest(request: Request): Date {
        let since: Date;

        if (request.query.since) {
            const sinceString: string = <string>request.query.since;
            since = new Date(sinceString);
        } else {
            // default last minute
            since = new Date();
            since.setTime(since.getTime() - 60000);
        }

        return since;
    }

    HandleGet(request: Request, h: ResponseToolkit): Lifecycle.Method | HandlerDecorations {
        const since: Date = this.DateFromRequest(request);

        return this.repository.ReadValues(this.collection, since);
    }
}
