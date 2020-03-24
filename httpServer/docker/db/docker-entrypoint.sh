#!/bin/bash
#always make sure this file uses linux line endings otherwise you will get https://forums.docker.com/t/standard-init-linux-go-175-exec-user-process-caused-no-such-file/20025
echo "Run customised docker-entrypoint file to enable replication, see original: https://github.com/docker-library/mongo/blob/master/docker-entrypoint.sh"

mongodcommand="/usr/bin/mongod --bind_ip_all --replSet rs0"

echo $mongodcommand

pidfile="${TMPDIR:-/tmp}/docker-entrypoint-temp-mongod.pid"
rm -f "$pidfile"

$mongodcommand --fork --logpath=./mongo.log --pidfilepath $pidfile

mongo=(mongo \""mongodb://localhost:27017/beademing?connect=direct;replicaSet=rs0"\")

echo "running init script"

echo $mongo $MONGO_INITDB_DATABASE /docker-entrypoint-initdb.d/mongo-init.js
echo "--------"
cat /docker-entrypoint-initdb.d/mongo-init.js
echo "--------"
echo

mongo --eval "printjson(rs.initiate())"
sleep 5
$mongo /docker-entrypoint-initdb.d/mongo-init.js

$mongodcommand --shutdown

rm -f "$pidfile"

exec $mongodcommand
