/* eslint-disable */
db.createCollection("volume_values");
db.createCollection("pressure_values");
db.createCollection("breathsperminute_values");
db.createCollection("trigger_values");
db.createCollection("settings");
db.createCollection("alarms");

db.volume_values.createIndex( { loggedAt: 1 } );
db.pressure_values.createIndex( { loggedAt: 1 } );
db.breathsperminute_values.createIndex( { loggedAt: 1 } );
db.trigger_values.createIndex( { loggedAt: 1 } );