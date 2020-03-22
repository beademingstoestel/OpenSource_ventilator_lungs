# Readme for the interface part of the beademingstoestel project

## Prerequisites to run the project

Any machine with docker and docker-compose installed.

## How to run the project

To start the server and the mongo server execute the following comnand in the same directory as this readme file:

``` 
docker-compose up --build
```

This will automatically create the necessary mongo database and collections, this database will be exposed on the standard port 27017.

To access the webinterface surf to http://localhost:3000