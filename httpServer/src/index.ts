import * as Hapi from '@hapi/hapi';
import { VolumeValuesController } from './Controllers/VolumeValuesController';
import { TestRepository } from './Repositories/TestRepository';
// eslint-disable-next-line no-unused-vars
import { IValuesRepository } from './Repositories/IValuesRepository';
import { MongoValuesRepository } from './Repositories/MongoValuesRepository';
import { TriggerValuesController } from './Controllers/TriggerValuesController';
import { PressureValuesController } from './Controllers/PressureValuesController';
import { BreathsPerMinuteValuesController } from './Controllers/BreathsPerMinuteValuesController';
import * as fs from 'fs';

/* define configuration */

const envData = fs.readFileSync('env.json', 'utf-8');
let environment = JSON.parse(envData);

if (fs.existsSync('env-local.json')) {
    const envLocalData = fs.readFileSync('env-local.json', 'utf-8');
    const environmentLocal = JSON.parse(envLocalData);
    environment = { ...environment, ...environmentLocal };
}

console.log(environment);

const host = environment.ListenInterface;
const port = environment.Port;

const repositoryFactory = function(): IValuesRepository {
    let repository: IValuesRepository = null;

    if (environment.RepositoryMode === 'test') {
        repository = new TestRepository();
    } else {
        repository = new MongoValuesRepository(`mongodb://${environment.DatabaseHost}:${environment.DatabasePort}/`);
    }

    return repository;
};

const server: Hapi.Server = new Hapi.Server(
    {
        host,
        port,
    });

const start = async function () {
    /* add plugins to server */
    await server.register([require('@hapi/inert'), require('@hapi/nes')]);

    /* define routes */
    server.route({
        method: 'GET',
        path: '/{param*}',
        handler: {
            directory: {
                path: './public',
                index: ['index.html', 'default.html'],
                listing: false,
            },
        },
    });

    server.route({
        method: 'GET',
        path: '/api/volume_values',
        handler: (request: Hapi.Request, h: Hapi.ResponseToolkit) => new VolumeValuesController(repositoryFactory()).HandleGet(request, h),
    });

    server.route({
        method: 'GET',
        path: '/api/pressure_values',
        handler: (request: Hapi.Request, h: Hapi.ResponseToolkit) => new PressureValuesController(repositoryFactory()).HandleGet(request, h),
    });

    server.route({
        method: 'GET',
        path: '/api/breathsperminute_values',
        handler: (request: Hapi.Request, h: Hapi.ResponseToolkit) => new BreathsPerMinuteValuesController(repositoryFactory()).HandleGet(request, h),
    });

    server.route({
        method: 'GET',
        path: '/api/trigger_values',
        handler: (request: Hapi.Request, h: Hapi.ResponseToolkit) => new TriggerValuesController(repositoryFactory()).HandleGet(request, h),
    });

    await server.start();
};

start();
