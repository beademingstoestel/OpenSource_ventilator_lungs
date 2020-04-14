// eslint-disable-next-line no-unused-vars
import { Request, ResponseToolkit, Lifecycle, HandlerDecorations } from '@hapi/hapi';
// eslint-disable-next-line no-unused-vars
import { IValuesRepository } from '../Repositories/IValuesRepository';
import { ValuesController } from './ValuesController';

export default class EventsController extends ValuesController {
    constructor(repository: IValuesRepository) {
        super(repository, 'events');
    }
}
