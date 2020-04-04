export = {
    register: async function (server, options) {
        var repository = options.logsRepository;

        server.events.on('log', function (event) {
            repository.WriteEntry({ ...event.data, ...{ loggedAt: event.timestamp } });
        });
    },
    once: true,
    requirements: {
        hapi: '>=19.0.0',
    },
    name: 'MongoDB logger',
}
