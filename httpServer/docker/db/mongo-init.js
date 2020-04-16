/* eslint-disable */
printjson(db.getSiblingDB("beademing").createCollection("measured_values"));
printjson(db.getSiblingDB("beademing").createCollection("settings"));
printjson(db.getSiblingDB("beademing").createCollection("events"));
printjson(db.getSiblingDB("beademing").createCollection("logs"));

printjson(db.getSiblingDB("beademing").measured_values.createIndex( { loggedAt: -1 } ));
printjson(db.getSiblingDB("beademing").logs.createIndex( { loggedAt: -1 } ));
printjson(db.getSiblingDB("beademing").logs.createIndex( { severity: 1 } ));
printjson(db.getSiblingDB("beademing").events.createIndex( { loggedAt: -1 } ));
