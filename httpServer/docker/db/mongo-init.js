/* eslint-disable */
printjson(db.createCollection("volume_values"));
printjson(db.createCollection("pressure_values"));
printjson(db.createCollection("breathsperminute_values"));
printjson(db.createCollection("trigger_values"));
printjson(db.createCollection("settings"));
printjson(db.createCollection("alarms"));

printjson(db.volume_values.createIndex( { loggedAt: 1 } ));
printjson(db.pressure_values.createIndex( { loggedAt: 1 } ));
printjson(db.breathsperminute_values.createIndex( { loggedAt: 1 } ));
printjson(db.trigger_values.createIndex( { loggedAt: 1 } ));
