import * as Hapi from '@hapi/hapi';
import { VolumeValuesController } from './Controllers/VolumeValuesController';
import { TestRepository } from './Repositories/TestRepository';
// eslint-disable-next-line no-unused-vars
import { IValuesRepository } from './Repositories/IValuesRepository';
import { MongoValuesRepository } from './Repositories/MongoValuesRepository';
import { TriggerValuesController } from './Controllers/TriggerValuesController';
import { PressureValuesController } from './Controllers/PressureValuesController';
import { BreathsPerMinuteValuesController } from './Controllers/BreathsPerMinuteValuesController';
import minimist = require('minimist');

/* define configuration */

const host = '0.0.0.0';
const port = 3000;

const argv: minimist.ParsedArgs = minimist(process.argv.slice(2));

const repositoryFactory = function(): IValuesRepository {
    let repository: IValuesRepository = null;

    if (argv.test) {
        repository = new TestRepository();
    } else {
        repository = new MongoValuesRepository('mongodb://mongo:27017/');
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
    await server.register(require('@hapi/inert'));

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

    server.start();
};

start();
