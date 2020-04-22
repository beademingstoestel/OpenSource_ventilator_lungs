// eslint-disable-next-line no-unused-vars
import { Request } from '@hapi/hapi';

export = {
    register: async function (server, options) {
        var repository = options.logsRepository;

        server.events.on('log', function (event) {
            repository.WriteEntry({ ...event.data, ...{ loggedAt: event.timestamp } });
        });

        server.ext('onPreResponse', (request, reply) => {
            if (request.response.isBoom) {
                repository.WriteEntry({
                    severity: 'error',
                    source: 'Node.js',
                    text: `Request: ${request.method} ${request.route.path}\n` +
                        `Payload: ${JSON.stringify(request.payload)}\n` +
                        `Params: ${JSON.stringify(request.params)}\n` +
                        `Query: ${JSON.stringify(request.query)}\n\n` +
                        `Error: ${request.response.message}\n\n` +
                        `Stack: ${request.response.stack}`,
                    loggedAt: new Date().getTime(),
                });
            }

            return reply.continue;
        });

        server.events.on('request', function (request: Request, event, tags) {
            if ((event.channel === 'internal' && !tags['accept-encoding'])) {
                return;
            }

            if (event.channel === 'app') {
                const existingText = event.data.text ?? '';

                event.data.text = `Request: ${request.method} ${request.route.path}\n\n${existingText}`;

                repository.WriteEntry({ ...event.data, ...{ loggedAt: event.timestamp } });
            }
        });
    },
    once: true,
    requirements: {
        hapi: '>=19.0.0',
    },
    name: 'MongoDB logger',
}
