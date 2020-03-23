# Readme for the interface part of the beademingstoestel project

# Using docker

## Prerequisites to run the project

Any machine with docker and docker-compose installed.

## How to run the project

To start the server and the mongo server execute the following comnand in the same directory as this readme file:

``` 
docker-compose up --build
```

This will automatically create the necessary mongo database and collections, this database will be exposed on the standard port 27017.

To access the webinterface surf to http://localhost:3001

## Using volumes to work on a running docker instance

To override some of the docker compose values and create volumes, start by adding a file named docker-compose.override.yml to the root of the project.

Edit it as shown to synchronize your local public folder with the docker public folder:

```
version: '3.4'

services:
  interface:
    image: beademingstoestel/interface
    volumes:
      - ./ui/public:/app/ui/public
```

# Using a local development setup

## Prerequisites

The project needs node 12 or higher to run. Make sure node, npm and typescript are installed. When testing with a database, a mongodb server should be available.

## Running the next.js interface in dev mode

Go the the ui directory and execute command:

```
npm install
npm run dev
```

## Running without docker

When not run in testing mode, the code will look for a mongodb server to fetch data from. Make sure the database defined in the environment values (see above) exists and create following collections and indices:

```
db.createCollection("volume_values");
db.createCollection("pressure_values");
db.createCollection("breathsperminute_values");
db.createCollection("trigger_values");
db.volume_values.createIndex( { loggedAt: 1 } );
db.pressure_values.createIndex( { loggedAt: 1 } );
db.breathsperminute_values.createIndex( { loggedAt: 1 } );
db.trigger_values.createIndex( { loggedAt: 1 } );
```

Afterwards proceed as you would normally to run a node.js project:

```
npm install
npm start
```

# Changing the environment values

Create a file called env-local.json in the root of the project. It is advisable to copy the existing env.json file. Change the values you want to adjust while running locally. This will work both while using docker or a local node install.

- DatabaseName: the name of the mongodb database
- DatabaseHost: the host where the mongodb service is running
- DatabasePort: the port used by the mongodb service
- RepositoryMode: _mongo_ to use the database or _test_ to return random values
- Port: the local port the http server should be listening on
- ListenInterface: the interface the http server should be listening on
- UpdateRate: the minimum time between websocket pushes of new data

# Endpoints and @hapi/nes subscribeable paths

- /api/error:
  - @hapi/nes: listen for errors raised by the controller or python
  - PUT: raise new error
- /api/settings:
  - @hapi/nes: listen for changes in the settings object
  - GET: retrieve the settings object
  - PUT: change the settings object
- /api/pressure_values
- /api/volume_values
- /api/trigger_values
- /api/breathsperminute_values
  - GET: retrieve an array with values
    - query parameter: since Date object, default 5 seconds ago
  - @hapi/nes: listen for new values coming in
