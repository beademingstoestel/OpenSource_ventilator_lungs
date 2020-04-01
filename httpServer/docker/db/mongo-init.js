/* eslint-disable */
printjson(db.getSiblingDB("beademing").createCollection("volume_values"));
printjson(db.getSiblingDB("beademing").createCollection("pressure_values"));
printjson(db.getSiblingDB("beademing").createCollection("breathsperminute_values"));
printjson(db.getSiblingDB("beademing").createCollection("trigger_values"));
printjson(db.getSiblingDB("beademing").createCollection("cpu_values"));
printjson(db.getSiblingDB("beademing").createCollection("flow_values"));
printjson(db.getSiblingDB("beademing").createCollection("settings"));
printjson(db.getSiblingDB("beademing").createCollection("alarms"));

printjson(db.getSiblingDB("beademing").volume_values.createIndex( { loggedAt: 1 } ));
printjson(db.getSiblingDB("beademing").pressure_values.createIndex( { loggedAt: 1 } ));
printjson(db.getSiblingDB("beademing").breathsperminute_values.createIndex( { loggedAt: 1 } ));
printjson(db.getSiblingDB("beademing").trigger_values.createIndex( { loggedAt: 1 } ));
printjson(db.getSiblingDB("beademing").flow_values.createIndex( { loggedAt: 1 } ));
printjson(db.getSiblingDB("beademing").cpu_values.createIndex( { loggedAt: 1 } ));
