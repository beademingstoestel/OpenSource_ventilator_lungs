// eslint-disable-next-line no-unused-vars
import { Request, ResponseToolkit, HandlerDecorations, Lifecycle } from '@hapi/hapi';
// eslint-disable-next-line no-unused-vars
import { IValuesRepository } from '../Repositories/IValuesRepository';

export class ValuesController {
    constructor(private repository: IValuesRepository, private collection: string, private filter: any = {}) {}

    DateFromRequest(request: Request, key: string = 'since'): Date {
        let date: Date;

        if (request.query[key]) {
            const sinceString: string = <string>request.query[key];
            date = new Date(+sinceString);
        } else {
            // default last 5 seconds
            date = new Date();
            if (key === 'since') {
                date.setTime(date.getTime() - 5000);
            }
        }

        return date;
    }

    HandleGet(request: Request, h: ResponseToolkit): Lifecycle.Method | HandlerDecorations {
        const since: Date = this.DateFromRequest(request, 'since');
        const until: Date = this.DateFromRequest(request, 'until');

        return this.repository.ReadValues(this.collection, since, until, this.filter);
    }
}
